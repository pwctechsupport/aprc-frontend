import React from 'react'
import classnames from 'classnames'
import Quill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export interface TextEditorProps {
  wrapperClassName?: string
  data?: string
  onChange?: (content: string) => void
  invalid?: boolean
}

const TextEditor = ({
  data,
  onChange,
  wrapperClassName,
  invalid,
}: TextEditorProps) => {
  return (
    <div
      className={classnames([
        'editor-wrapper',
        wrapperClassName,
        invalid && 'invalid',
      ])}
    >
      <Quill
        value={data}
        onChange={onChange}
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{color: []}, {background: []}],
            [{ 'font': [] }],
            [{ 'align': [] }],
            [
              { list: 'ordered' },
              { list: 'bullet' },
              { indent: '-1' },
              { indent: '+1' },
            ],
            ['link', 'image'],
            ['clean'],
          ],
        }}
        formats={[
          'header',
          'bold',
          'italic',
          'underline',
          'color',
          'background',
          'font',
          'align',
          'strike',
          'blockquote',
          'list',
          'bullet',
          'indent',
          'link',
          'image',
        ]}
      />
    </div>
  )
}

export default TextEditor
