import { Fragment, useRef, useState } from 'react'

export const App = () => {
  const textbox = useRef<HTMLInputElement>(null)
  const [err, setErr] = useState<string>('')
  const handler = () => {
    try {
      parent.postMessage(
          {
            pluginMessage: {
              type: 'create-rectangles',
              count: parseInt(textbox.current?.value || '0', 10),
            },
          },
          '*'
      )
    } catch (e) {
      setErr((e as object).toString())
    }
  }
  return (
    <Fragment>
      <h2>hello</h2>
      <input type="number" ref={textbox} />
      <button onClick={handler}>Insert</button>
      <p>{err}</p>
    </Fragment>
  )
}
