# NutUml
NutUml is A tool to generate UML diagram via text. For online preview you can visit [http://www.nutuml.com/](http://www.nutuml.com/)


## Get Start

We describe the upper image by:
```
Client -> Server : Request
Server -> Client : Response
```
You can use the follow Code to try. Remember download nutuml.js to your local.

```
<script src="nutuml.js"></script>
<div id="myCanvas"></div>
    
<script type="text/javascript">
var c=document.getElementById("myCanvas");
var umlText = "Client -> Server : Request\n"
    + "Server -> Client : Response";
c.innerHTML=nutuml.render(umlText);
</script>
```
Thank you!
