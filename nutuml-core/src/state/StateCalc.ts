import StateContext from "./StateContext";
import StateNode from "./StateNode";
import utils from "../utils";

import { ROOT_TEXT_CONFIG, FIRST_TEXT_CONFIG, SECOND_TEXT_CONFIG } from "../config/constant";
import { STATE } from "./State";
import StateEdge from "./StateEdge";
const PAGE_PADDING = 50;

const NODE_SPAN = 100;

class GridItem{
    x:number;
    y:number;
}
class GridBatch {
    gx:number;
    gy:number;
    nodes:StateNode[];
}

export default function calc(context:StateContext):void {
    calcSize(context);
    calcXY(context);
    clacEdgeXY(context);

    context.svgWidth = 1200;
    context.svgHeight = 800;
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

        if(node.name === STATE.START || node.name === STATE.END){
            node.width = STATE.HEAD_RADIUS * 2;
            node.height = STATE.HEAD_RADIUS * 2;
            continue;
        }
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

    // 初步 计算 中心坐标
    let maxX = []
    for(let i=0;i<nodes.length;i++){
        let node = nodes[i];
        let gridX = node.gridX;
        node.centerX = Math.round( PAGE_PADDING + node.width/2 + NODE_SPAN*gridX);
        node.centerY = Math.round( PAGE_PADDING + node.gridY*100 + node.height/2);
        if(maxX[gridX]===undefined || maxX[gridX]<node.centerX){
            maxX[gridX] = node.centerX;
        }
    }
    for(let i=0;i<nodes.length;i++){
        let node = nodes[i];
        let gridX = node.gridX;

        if(node.centerX<maxX[gridX]){
            node.centerX = maxX[gridX]
        }
    }
}
/**
 * 计算 节点 格子
 * @param context 
 */
function calcGrid(context: StateContext) {
    calcEdges(context);
    let gridArr = [];
    gridArr[0] =[];
    //记录 是否已处理过
    var map = new Map();
    for(var i in context.edges){
        var edge = context.edges[i];
        var node = edge.from;
        if(map.has(node.name)){
            continue;
        }
        oneNodeGrid(gridArr,node);
        map.set(node.name,1);
    }
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

function fixGrid(context: StateContext, minGx: number, minGy: number) {
    let nodes = context.nodes;
    let xSpan = 0-minGx;
    let ySpan =0-minGy;
    nodes.map((item)=>{
        item.gridX += xSpan;
        item.gridY += ySpan;
    })
}


function oneNodeGrid(gridArr: StateNode[][], node: StateNode) {
    let pFind = node.gridX !== undefined;
    let cFind = false;
    
    node.nextNodes?.map(t=>{
        if(t.gridX !==undefined){
            cFind =true;
        }
    });

    if(pFind){
        if(cFind){
            // 父节点 和 子节点 都在网络上了。
            let y = node.gridY + 1;
            if(gridArr[y]===undefined){
                gridArr[y] = []
            }

            let start = gridArr[y].length;
            if(y%2 === 0){
                start += 1
            }
            
            for(let j=0;j<node.nextNodes?.length;j++){
                let child = node.nextNodes[j];
                if(child.gridX === undefined){
                    let x = start + 2 * j;
                    gridArr[y][x] = node.nextNodes[j];
                    node.nextNodes[j].gridX = x;
                    node.nextNodes[j].gridY = y;
                }else if(!circle(node,child)){
                    // 无循环引用，子降
                    gridArr[child.gridY][child.gridX] = undefined;
                    let x = child.gridX;
                    while(gridArr[y][x]!== undefined){
                        x++;
                    }
                    gridArr[y][x] = child;
                    child.gridX = x;
                    child.gridY = y;
                }
            }
        }else{
            // 父节点 在网格上 子节点不在 。 记录子节点
            let y = node.gridY + 1;
            if(gridArr[y]===undefined){
                gridArr[y] = []
            }
            let start = gridArr[y].length;
            if(y%2 === 0){
                start += 1
            }
            for(let j=0;j<node.nextNodes?.length;j++){
                let x = start + 2 * j;
                gridArr[y][x] = node.nextNodes[j];
                node.nextNodes[j].gridX = x;
                node.nextNodes[j].gridY = y;
            }
        }
    }else{
        if(cFind){

        }else{
            // 父节点 和 子节点 都不在网格上： 初始化 + 记录
            let x = gridArr[0].length;
            node.gridX = x;
            node.gridY = 0;
            gridArr[0][x] = node;
            if(gridArr[1]===undefined){
                gridArr[1] = [];
            }
            let start = gridArr[1].length;
            for(let j=0;j<node.nextNodes?.length;j++){
                gridArr[1][j] = node.nextNodes[j];
                node.nextNodes[j].gridX = start + j;
                node.nextNodes[j].gridY = 1;
            }
        }
    }
    
}
/**
 * 判断两个节点是否存在 循环引用
 * @param parent 父节点 
 * @param child 子节点
 * @returns 
 */
function circle(parent: StateNode, child: StateNode) {
    var map = new Map();
    
    if(child.nextNodes ===undefined){
        return false;
    }
    let arr = [...child.nextNodes]
    while(arr.length>0){
        let node = arr.pop();
        if(node.name === parent.name){
            return true
        }else{
            node.nextNodes?.forEach(t=>{
                if(!map.has(t.name)){
                    arr.push(t)
                }
            })
        }
        map.set(node.name,1)
    }
    return false
}

function clacEdgeXY(context: StateContext) {
    for(var i in context.edges){
        var edge = context.edges[i];
        calcOneEdge(edge);
    }
}
function calcOneEdge(edge: StateEdge) {
    var from = edge.from;
    var to = edge.to;
    // 上 下 左 右  左上  左下  右上  右下
    let xSpan = to.gridX - from.gridX
    let ySpan = to.gridY - from.gridY
    if(xSpan > 0){
        // 右
        edge.fromX = from.centerX + from.width/2
        edge.fromY = from.centerY
        if(ySpan>0){
            // 右下
            edge.toX = to.centerX
            edge.toY = to.centerY - to.height/2
            edge.direction = STATE.RIGHT_DOWN;
        }else if(ySpan<0){
            edge.toX = to.centerX
            edge.toY = to.centerY + to.height/2
        }else{
            if(xSpan>0){
                // 右
                edge.toX = to.centerX - to.width/2;
                edge.toY = to.centerY 
            }else if(xSpan<0){
                // 左
                edge.toX = to.centerX + to.width/2;
                edge.toY = to.centerY 
            }else{
                // 同一节点  ，不应该跑到这个逻辑里
            }
        }
    }else if(xSpan< 0){
        // 左
        edge.fromX = from.centerX - from.width/2
        edge.fromY = from.centerY
        if(ySpan>0){
            // 左下
            edge.fromX = from.centerX
            edge.fromY = from.centerY + to.height/2
            edge.toX = to.centerX + to.width/2
            edge.toY = to.centerY
            edge.direction = STATE.LEFT_DOWN
        }else if(ySpan<0){
            edge.toX = to.centerX
            edge.toY = to.centerY + to.height/2
        }else{
            if(xSpan>0){
                // 右
                edge.toX = to.centerX - to.width/2;
                edge.toY = to.centerY 
            }else if(xSpan<0){
                // 左
                edge.toX = to.centerX + to.width/2;
                edge.toY = to.centerY 
            }else{
                // 同一节点  ，不应该跑到这个逻辑里
            }
        }
    }else{
        // 上下
        if(ySpan>0){
            //下
            edge.fromX = from.centerX
            edge.fromY = from.centerY + from.height/2
        }else if(ySpan<0){
            //上
            edge.fromX = from.centerX
            edge.fromY = from.centerY - from.height/2
        }else{
            // 同一节点 ，不应该跑到这个逻辑里
        }

        if(ySpan>0){
            edge.toX = to.centerX
            edge.toY = to.centerY - to.height/2
        }else if(ySpan<0){
            edge.toX = to.centerX
            edge.toY = to.centerY + to.height/2
        }else{
            if(xSpan>0){
                // 右
                edge.toX = to.centerX - to.width/2;
                edge.toY = to.centerY 
            }else if(xSpan<0){
                // 左
                edge.toX = to.centerX + to.width/2;
                edge.toY = to.centerY 
            }else{
                // 同一节点  ，不应该跑到这个逻辑里
            }
        }
    }

    
}

