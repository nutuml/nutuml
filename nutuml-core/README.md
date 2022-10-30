# NutUml
NutUml is A tool to generate UML diagram via text. For online preview you can visit [https://www.nutuml.com/](https://www.nutuml.com/)


## Get Start

We describe a sequence sample by:
```
Client -> Server : Request
Server -> Client : Response
```
You can use the follow Code to try. Remember download nutuml.js to your local.

```
<script src="nutuml.js"></script>
<div id="test"></div>
<script>
    var text = 'Client -> Server : Request\nServer -> Client : Response';
    document.getElementById("test").innerHTML = nutuml.render(text);
</script>
```
Thank you!
