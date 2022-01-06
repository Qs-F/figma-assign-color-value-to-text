import Color from 'color'

const walk = async <StackNode>(
  root: SceneNode,
  f: (node: SceneNode, stack?: StackNode[]) => boolean | Promise<boolean>,
  stack?: StackNode[]
) => {
  if (!(await f(root, stack))) {
    return
  }
  if (!('children' in root)) {
    return
  }
  await Promise.all(
    root.children.map(async (child) => {
      await walk(child, f)
    })
  )
}

const loadFonts = async (node: TextNode) => {
  for (const font of node.getRangeAllFontNames(0, node.characters.length)) {
    await figma.loadFontAsync(font)
  }
}

const main = async () => {
  figma.showUI(__html__, { visible: false })

  const nodes = figma.currentPage.selection

  if (nodes.length < 1) {
    figma.notify('Please select at least one node')
    figma.closePlugin()
  }

  await Promise.all(
    nodes.map(async (node) => {
      if (!('fills' in node)) {
        return
      }
      if (node.fills === figma.mixed) {
        return
      }
      if (node.fills.length < 1) {
        return
      }
      if (node.fills[0]?.type !== 'SOLID') {
        return
      }
      const fill = new Color(
        Object.fromEntries(
          Object.entries(node.fills[0].color).map(([k, v]) => [k, v * 255])
        )
      )
      await walk(
        node,
        async (node): Promise<boolean> => {
          if (node.type !== 'TEXT') {
            return true
          }
          if (node.name === '$hex') {
            await loadFonts(node)
            node.characters = fill.hex()
            return true
          }
          if (node.name === '$hsl') {
            await loadFonts(node)
            node.characters = fill.hsl().round().string()
            return true
          }
          return true
        }
      )
    })
  )
  figma.notify('Done ✨')
  figma.closePlugin()
}

main()
