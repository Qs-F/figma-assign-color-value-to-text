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

const apply = async (node: TextNode, text: string): Promise<boolean> => {
  await Promise.all(
      node.getRangeAllFontNames(0, node.characters.length).map(async (font) => {
        await figma.loadFontAsync(font)
      })
  )
  node.characters = text
  return true
}

const main = async () => {
  figma.showUI(__html__, { visible: false })

  const nodes = figma.currentPage.selection

  if (nodes.length < 1) {
    figma.closePlugin('Please select at least one node')
    return
  }

  await Promise.all(
      nodes.map(async (node) => {
        if (!('fills' in node)) {
          figma.notify('😱 No fill')
          return
        }
        if (node.fills === figma.mixed) {
          figma.notify('😱 Color is mixed (only 1 fill is allowed)')
          return
        }
        if (node.fills.length < 1) {
          figma.notify('😱 Multiple colors are set (only 1 fill is allowed)')
          return
        }
        if (node.fills[0]?.type !== 'SOLID') {
          figma.notify(
              '😱 Color is not solid (probably gradient or image is set)'
          )
          return
        }
        const styleName =
        (node.fillStyleId !== '' &&
          node.fillStyleId !== figma.mixed &&
          figma.getStyleById(node.fillStyleId)?.name) ||
        ''
        const alpha = node.fills[0].opacity || 1
        const fill = new Color(
            Object.entries(node.fills[0].color).map(([, v]) => v * 255),
            'rgb'
        )
        const fillA = new Color(
            [
              ...Object.entries(node.fills[0].color).map(([, v]) => v * 255),
              parseFloat(alpha.toFixed(4)),
            ],
            'rgb'
        )
        await walk(
            node,
            async (node): Promise<boolean> => {
              if (node.type !== 'TEXT') {
                return true
              }
              switch (node.name) {
                case '$hex':
                  return apply(node, fill.hex())
                case '$hsl':
                  return apply(node, fill.hsl().round().string())
                case '$hsla':
                  return apply(node, fillA.hsl().round().string())
                case '$rgb':
                  return apply(node, fill.rgb().round().string())
                case '$rgba':
                  return apply(node, fillA.rgb().round().string())
                case '$alpha':
                  return apply(node, alpha.toFixed(4))
                case '$styleName':
                  return apply(node, styleName)
              }
              return true
            }
        )
      })
  )
  figma.closePlugin('Done ✨')
}

main()
