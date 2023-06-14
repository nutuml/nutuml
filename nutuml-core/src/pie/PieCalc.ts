import PieContext from "./PieContext";

const PI = 3.14159265;
const R = 150;
const PADDING = 10;

const cx = R + PADDING;
const cy = R + PADDING;

export default function calc(context:PieContext):void {
    let len = context.items.length;
    let total = 0;
    context.cx = cx;
    context.cy = cy;
    context.r = R;

    for (var i = 0; i < len; i++) {
        let item =context.items[i]
        total += item.value
    }

    let curTotal = 0;
    for (var i = 0; i < len; i++) {
        let item =context.items[i]
        curTotal += item.value
        let radian = curTotal * 2 * PI / total;
        let y = R * Math.sin(radian);
        item.y = context.cy - y;
        let x = R * Math.cos(radian);
        item.x = context.cx + x;
        item.percent = item.value / total;
    }

    context.svgWidth = 1200;
    context.svgHeight = 800;
}