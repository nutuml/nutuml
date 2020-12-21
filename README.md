# NutUml
NutUml is A tool to generate UML diagram via text. For online preview you can visit [http://www.nutuml.com/](http://www.nutuml.com/)

A generated UML secquence are as follow:
![avatar](https://7niu.genlei.cn/nutuml-demo-20201220.png)

## Get Start

We describe the upper image by:
```
Client -> Server : Request
Server -> Client : Response
```
You can use the follow Code to try. Remember download nutuml.js to your local.

```
<script src="nutuml.js"></script>
<div id="myCanvas" style="border:1px solid #c3c3c3;"></div>
    
<script type="text/javascript">
var c=document.getElementById("myCanvas");
var umlText = "Client -> Server : Request\n"
    + "Server -> Client : Response";
var uml = new NutUml(c);
uml.drawUml(umlText);
</script>
```
Thank you!
