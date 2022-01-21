import nutuml from './nutuml';

function init() {

    // Delete existing mermaid outputs
    for (const possibleMermaidErrorOut of document.getElementsByTagName('svg')) {
        const parent = possibleMermaidErrorOut.parentElement;
        if (parent && parent.id.startsWith('nutuml')) {
            parent.remove();
        }
    }

    let i = 0;
    for (const mermaidContainer of document.getElementsByClassName('nutuml')) {
        const id = `nutuml-${Date.now()}-${i++}`;
        const source = mermaidContainer.textContent;

        const out = document.createElement('div');
        out.id = id;
        mermaidContainer.innerHTML = '';
        mermaidContainer.appendChild(out);
        out.innerHTML = nutuml.render(source);
    }
}


window.addEventListener('vscode.markdown.updateContent', init);

init();