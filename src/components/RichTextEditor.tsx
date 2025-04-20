
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value, onChange, className="", style={}, readOnly=false, minHeight="300px"
}) => {
  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      className={className}
      theme={readOnly ? 'bubble' : 'snow'}
      readOnly={readOnly}
      style={{
        background: readOnly ? "transparent" : "#fff",
        minHeight,
        ...style,
      }}
      modules={{
        toolbar: readOnly ? false : [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          ['clean']
        ]
      }}
      formats={[
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'indent', 'align',
        'blockquote', 'code-block',
        'link', 'image'
      ]}
    />
  )
};

export default RichTextEditor;
