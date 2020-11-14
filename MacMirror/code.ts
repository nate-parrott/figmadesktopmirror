const CODE_KEY = "code2";

function getCurrentFrame(): FrameNode | undefined {
  if (figma.currentPage.selection.length === 0) {
    return undefined;
  }
  function _getCurrentFrame(node: BaseNode): FrameNode | undefined {
    if (node.type === "FRAME") {
      return node as FrameNode;
    }
    if (node.parent) {
      return _getCurrentFrame(node.parent);
    }
    return undefined;
  }
  return _getCurrentFrame(figma.currentPage.selection[0]);
}

// root frame
function getArtboard(startingNode: BaseNode): FrameNode | undefined {
  function getNodeAncestors(base: BaseNode): FrameNode[] {
    const parents = base.parent ? getNodeAncestors(base.parent) : [];
    if (base.type === "FRAME") {
      return [...parents, base as FrameNode];
    }
    return parents;
  }
  const a = getNodeAncestors(startingNode);
  return a.length ? a[0] : undefined;
}

function findNodeContainingString(
  root: SceneNode,
  str: string
): SceneNode | undefined {
  const matches: SceneNode[] = [];
  traverseSceneNodes(root, (node) => {
    if (node.name.toLowerCase().indexOf(str) > -1) {
      matches.push(node);
    }
  });
  return matches.length ? matches[0] : undefined;
}

function traverseSceneNodes(
  root: SceneNode,
  callback: (node: SceneNode) => void
) {
  callback(root);
  if ((root as ChildrenMixin).children) {
    for (let child of (root as ChildrenMixin).children) {
      traverseSceneNodes(child, callback);
    }
  }
}

function hideNodesWithSubstringInName(
  substring: string,
  root: SceneNode
): () => void {
  var idsToShow = {};
  traverseSceneNodes(root, (node) => {
    if (node.name.toLocaleLowerCase().indexOf(substring) > -1 && node.visible) {
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

function findStartingNode(): SceneNode | undefined {
  const cur = getCurrentFrame();
  if (!cur) return undefined;
  const ab = getArtboard(cur);
  if (ab) {
    const mirror = findNodeContainingString(ab, "[mirror]");
    if (mirror) {
      return mirror;
    }
  }
  return cur;
}

function exportImage() {
  const curFrame = findStartingNode();
  console.log("NODE: ", curFrame.name);
  if (!curFrame) {
    figma.ui.postMessage({
      type: "message",
      text: "Select a frame and then press 'mirror'.",
    });
    return;
  }
  const settings: ExportSettingsImage = {
    format: "PNG",
    constraint: {
      type: "SCALE",
      value: 2,
    },
  };

  const unhide = hideNodesWithSubstringInName("[not mirrored]", curFrame);
  curFrame.exportAsync(settings).then((data) => {
    unhide();
    figma.clientStorage.getAsync(CODE_KEY).then((code) => {
      console.log("Data length: ", data.length);
      figma.ui.postMessage({ type: "uploadImage", data: data, code });
    });
  });
}

const SIZES: { [key: string]: { width: number; height: number } } = {
  small: { width: 100, height: 100 },
  large: { width: 400, height: 300 },
};

function main() {
  figma.showUI(__html__, SIZES.small);
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "exportImage") {
      exportImage();
    } else if (msg.type === "persistCode") {
      figma.clientStorage.setAsync(CODE_KEY, msg.code);
    } else if (msg.type === "resize") {
      const { width, height } = SIZES[msg.size];
      figma.ui.resize(width, height);
    }
  };
}

main();
