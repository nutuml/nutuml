// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "nutuml" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('nutuml.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World  !');
	});
 
	context.subscriptions.push(disposable);
    var panel: vscode.WebviewPanel;
	const resourceRoot = context.extensionPath;
	let lastTimestamp = new Date().getTime();


	disposable = vscode.workspace.onDidChangeTextDocument(e => {
        if (!e || !e.document || !e.document.uri) return;
        lastTimestamp = new Date().getTime();
        setTimeout(() => {
            if (new Date().getTime() - lastTimestamp >= 400) {
                console.log(e.document.languageId)
                console.log(e.document.getText())
                if(panel){
                	panel.webview.postMessage({text: e.document.getText()});
				}

            }
        }, 500);
    });
    context.subscriptions.push(disposable);

  disposable = vscode.window.onDidChangeTextEditorSelection(e => {
      if(e.textEditor.document.languageId != "nutuml"){
        return;
      }
      lastTimestamp = new Date().getTime();
      setTimeout(() => {
          if (new Date().getTime() - lastTimestamp >= 400) {
            console.log(e.textEditor.document.languageId)
            console.log(e.textEditor.document.getText())
            if(panel  && vscode.window.activeTextEditor){
              panel.webview.postMessage({text: vscode.window.activeTextEditor.document.getText()});}
          }
      }, 500);
  });
  context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('nutuml.showPreview', () => {
        // Create and show panel

        panel = vscode.window.createWebviewPanel(
          'nutuml',
          'Nutuml Preview',
          vscode.ViewColumn.Two,
          {enableScripts: true}
        );
		    let resourceRoot = path.join(context.extensionPath, "static");
        // And set its HTML content
        panel.webview.html = loadFile(panel.webview,resourceRoot,"index.html");
        if(vscode.window.activeTextEditor){
          panel.webview.postMessage(
            {text: vscode.window.activeTextEditor.document.getText()}
          );
        }else{
          console.log("no active text editor.")
        }
  });
    
  context.subscriptions.push(disposable);
}

function getWebviewContent() {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
    Cat Coding <BR>
      <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="50" />
      <script>
      console.log('script test...')
      window.addEventListener('message', event => {
        const message = event.data;
        console.log('Webview接收到的消息：', message);
    });
      </script>
  </body>
  </html>`;
  }
// this method is called when your extension is deactivated
export function deactivate() {}

function loadFile(webview:vscode.Webview, resourceRoot:string, file: string): string {
	file = path.join(resourceRoot, file);
	return evalHtml(webview,resourceRoot, fs.readFileSync(file).toString());
}
function evalHtml(webview:vscode.Webview,resourceRoot:string,html: string): string {
	//let envReg = /\$\{(.+?)\}/ig;
	//html = html.replace(envReg, '${env.$1}');
	let result: string = eval('`' + html + '`');
	// convert relative "src", "href" paths to absolute
	let linkReg = /(src|href)\s*=\s*([`"'])(.+?)\2/ig;
	let base: string = resourceRoot;
	result = result.replace(linkReg, (match, ...subs) => {
		let file = subs[2] as string;
		if (!path.isAbsolute(file)) file = path.join(base, file);
		console.log("file:",file)
		if (!fs.existsSync(file)) return match;
		let uri = webview.asWebviewUri(vscode.Uri.file(file));
		return `${subs[0]}=${subs[1]}${uri}${subs[1]}`;
	});
	return result;
}