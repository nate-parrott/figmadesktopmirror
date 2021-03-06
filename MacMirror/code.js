var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getCurrentFrame() {
    if (figma.currentPage.selection.length === 0) {
        return undefined;
    }
    function _getCurrentFrame(node) {
        if (node.type === 'FRAME') {
            return node;
        }
        if (node.parent) {
            return _getCurrentFrame(node.parent);
        }
        return undefined;
    }
    return _getCurrentFrame(figma.currentPage.selection[0]);
}
function traverseSceneNodes(root, callback) {
    callback(root);
    if (root.children) {
        for (let child of root.children) {
            traverseSceneNodes(child, callback);
        }
    }
}
function hideNodesWithSubstringInName(substring, root) {
    var idsToShow = {};
    traverseSceneNodes(root, (node) => {
        if (node.name.toLocaleLowerCase().search(substring) > -1 && node.visible) {
            node.visible = false;
            idsToShow[node.id] = 1;
        }
    });
    const unhideFunction = () => {
        traverseSceneNodes(root, (node) => {
            if (idsToShow[node.id]) {
                node.visible = true;
            }
        });
    };
    return unhideFunction;
}
function exportImage() {
    const curFrame = getCurrentFrame();
    if (curFrame) {
        const settings = {
            format: 'PNG',
            constraint: {
                type: 'SCALE',
                value: 2
            }
        };
        const unhide = hideNodesWithSubstringInName('not mirrored', curFrame);
        curFrame.exportAsync(settings).then(data => {
            unhide();
            // const b64 = bytesToBase64(data);
            // figma.showUI(__html__);
            // figma.ui.postMessage({ type: 'networkRequest', key: 'd88efbab35914a93b665de9ad299a8ea', imageBase64: b64 })
            figma.clientStorage.getAsync('code').then((code) => {
                figma.ui.postMessage({ type: 'exportImage', data: data, code });
            });
            // figma.ui.onmessage = async (msg) => {
            //   figma.closePlugin()
            // }
        });
    }
    else {
        figma.ui.postMessage({ type: 'message', text: "Select a frame and then press 'mirror'." });
        // figma.closePlugin()
    }
}
function main() {
    figma.showUI(__html__, {
        width: 400,
        height: 300
    });
    figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
        if (msg.type === 'exportImage') {
            exportImage();
        }
        else if (msg.type === 'persistCode') {
            figma.clientStorage.setAsync('code', msg.code);
            console.log('persisted code!');
        }
    });
}
main();
