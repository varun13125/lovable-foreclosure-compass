
import React, { useRef, useEffect, useState } from 'react';
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
  const quillRef = useRef<ReactQuill>(null);
  
  // Handle content change
  const handleChange = (content: string) => {
    onChange(content);
  };

  return (
    <div 
      className="rich-text-editor-wrapper" 
      style={{ 
        height: minHeight,
        position: 'relative',
      }}
    >
      {/* Apply styles directly to avoid JSX style error */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-editor-wrapper .ql-container {
          height: calc(100% - 42px);
          overflow: auto;
        }
        
        .rich-text-editor-wrapper .ql-editor {
          height: 100%;
          overflow-y: auto;
          min-height: ${readOnly ? minHeight : 'auto'};
        }
        
        /* Prevent focus outline */
        .rich-text-editor-wrapper .ql-editor:focus {
          outline: none;
        }
        
        /* Fix for scroll jumping */
        .rich-text-editor-wrapper {
          contain: strict;
          overflow: hidden;
        }
      ` }} />
      
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        className={className}
        theme={readOnly ? 'bubble' : 'snow'}
        readOnly={readOnly}
        style={{
          height: "100%",
          background: readOnly ? "transparent" : "#fff",
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
        preserveWhitespace={true}
      />
    </div>
  );
};

export default RichTextEditor;
