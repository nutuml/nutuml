import StateContext from "./StateContext";
import StateNode from "./StateNode";
import utils from "../utils";

import { ROOT_TEXT_CONFIG, FIRST_TEXT_CONFIG, SECOND_TEXT_CONFIG } from "../config/constant";
import { STATE } from "./State";
const PAGE_PADDING = 50;

const NODE_SPAN = 200;

class GridItem{
    x:number;
    y:number;
}
class GridBatch {
    gx:number;
    gy:number;
    nodes:StateNode[];
}
/**
 * 按以下格子 排列坐标，
 * 24  23  20  21  22
 * 19   8   6   7  18
 * 14   4   0   2  10
 * 16   5   1   3  12
 * 15  17   9  13  11
 * 
 */
const GRID_ARR = [
//1-8
    [0,1],
    [1,0],
    [1,1],
    [-1,0],
    [-1,1],
    [0,-1],
    [1,-1],
    [-1,-1],
// 9-24
    [0,2],
    [2,0],
    [2,2],
    [2,1],
    [1,2],
    [-2,0],
    [-2,2],
    [-2,1],
    [-1,2],
    [2,-1],
    [-2,-1],
    [0,-2],
    [1,-2],
    [2,-2],
    [-1,-2],
    [-2,-2]

]

export default function calc(context:StateContext):void {
    calcSize(context);
    calcXY(context);

    context.svgWidth = 400;
    context.svgHeight = 400;
}
function calcSize(context:StateContext){
    let textConfig = FIRST_TEXT_CONFIG;
    let nodes = context.nodes;
    if(!nodes){
        return;
    }
    for(let i=0;i<nodes.length;i++){
        let node = nodes[i];
        node.textConfig = textConfig;
        let textMeasure = utils.calculateTextDimensions(node.title,textConfig);
        node.textWidth = textMeasure.width;
        node.textHeight = textMeasure.height;

        node.width = textMeasure.width + textConfig.horizonSpace;
        node.height = textMeasure.height + textConfig.verticalSpace;
    }
}
function calcXY(context:StateContext){
    let nodes = context.nodes;
    if(!nodes){
        return;
    }
    calcGrid(context);
    if(context.error){
        return;
    }

    for(let i=0;i<nodes.length;i++){
        let node = nodes[i];
        node.centerX = Math.round( PAGE_PADDING + node.width/2 + NODE_SPAN*node.gridX);
        node.centerY = Math.round( PAGE_PADDING + node.gridY*100 + node.height/2);
    }
}
/**
 * 计算 节点 格子
 * @param context 
 */
function calcGrid(context: StateContext) {
    calcEdges(context);
    if(context.startNode=== undefined){
        context.error =" No [*] start node found."
        return;
    }
    let gx = 0;
    let gy = 0;
    let gridMap = new Map();
    context.startNode.gridX = gx;
    context.startNode.gridY = gy;
    gridMap.set(gridKey(gx,gy),1);

    let arr:GridBatch[] = [];
    arr.push({
        gx:gx,
        gy:gy,
        nodes:context.headNodes
    })
    let map = new Map();
    map.set(context.startNode.name,1);

    while(arr.length>0){
        let node = arr.pop()
        if(node.nodes === undefined || node.nodes.length==0){
            continue;
        }
        for(let i=0;i<node.nodes.length;i++){
            let n = node.nodes[i];
            if(map.has(n.name)){
                continue;
            }
            let item = getGrid(i);
            n.gridX = node.gx + item.x;
            n.gridY = node.gy + item.y;
            map.set(n.name,1);
            arr.push({
                gx: n.gridX,
                gy: n.gridY,
                nodes: n.nextNodes
            })
        }
    }
}
function getGrid(i:number):GridItem{
    if(i<0){
        return {x:-1,y:-1};
    }
    if(i>= GRID_ARR.length){
        return {x: i%5 ,y: Math.round(i/5 -2)}
    }
    return {x:GRID_ARR[i][0], y:GRID_ARR[i][1]}
}
function gridKey(gx:number,gy:number){
    return gx + ',' + gy;
}

function nodeSort(nodeA: StateNode, nodeB: StateNode){
    return nodeB.edges - nodeA.edges;
}

function addEdgeCount(m: Map<any, any>, name: string) {
    if(m.has(name)){
        m.set(name,m.get(name)+1)
    }else{
        m.set(name,1)
    }
}

function calcEdges(context: StateContext) {
    let arr = [];
   var m = new Map();
   // 统计 节点边数， 统计 开始节点 次级节点  和 结束节点的 上级节点
   for(var i in context.edges){
        var edge = context.edges[i];
        addEdgeCount(m,edge.from.name);
        addEdgeCount(m,edge.to.name);
        if(edge.from.name === STATE.START){
            context.addHead(edge.to)
            context.startNode = edge.from
        }
        if(edge.to.name === STATE.END){
            context.addTail(edge.from)
        }
   }
   for(var i in context.nodes){
        let node = context.nodes[i];
        if(node.name != STATE.START && node.name != STATE.END){
            arr.push(node);
            if(m.has(node.name)){
                node.edges = m.get(node.name)
            }else{
                node.edges = 0
            }
        }
   }
   context.headNodes.sort(nodeSort)
   context.tailNodes.sort(nodeSort)
   context.nodes.sort(nodeSort)
}

