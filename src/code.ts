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

const main = async () => {
  figma.showUI(__html__, { visible: false })

  const nodes = figma.currentPage.selection

  if (nodes.length < 1) {
    figma.notify('Node を選択してください')
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
      const rgb = node.fills[0].color
      await walk(
        node,
        async (node): Promise<boolean> => {
          if (node.name === '$hex' && node.type === 'TEXT') {
            for (const font of node.getRangeAllFontNames(
              0,
              node.characters.length
            )) {
              console.log(font)
              await figma.loadFontAsync(font)
              console.log('finished')
            }
            console.log(rgb)
            const color = Color({
              r: rgb.r * 255,
              g: rgb.g * 255,
              b: rgb.b * 255,
            })
            node.characters = color.hex()
          }
          return true
        }
      )
    })
  )
  figma.closePlugin()
}

main()

// figma.ui.onmessage = () => {
//   const selected = figma.currentPage.selection
//   if (selected.length < 1) {
//     figma.notify('Please select 1 node')
//     figma.closePlugin()
//   }
//   figma.currentPage.selection = nodes
//   figma.viewport.scrollAndZoomIntoView(nodes)
// }
