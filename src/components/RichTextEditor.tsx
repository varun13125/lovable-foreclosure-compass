
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Handle content change without losing focus
  const handleChange = (content: string) => {
    onChange(content);
  };
  
  // Initialize the editor once the component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fix scroll jumping issue by isolating the editor in its own scrollable container
  useEffect(() => {
    if (!readOnly && isMounted) {
      const editorElement = containerRef.current;
      if (editorElement) {
        // Make sure clicks inside the editor don't propagate and affect page scroll
        const preventPropagation = (e: MouseEvent) => {
          e.stopPropagation();
        };
        
        editorElement.addEventListener('click', preventPropagation);
        
        // Clean up
        return () => {
          editorElement.removeEventListener('click', preventPropagation);
        };
      }
    }
  }, [readOnly, isMounted]);
  
  return (
    <div 
      ref={containerRef}
      className="quill-editor-container" 
      style={{ 
        height: minHeight,
        position: 'relative',
        isolation: 'isolate', // Create a new stacking context
      }}
    >
      <style jsx>{`
        /* Global styles to prevent scroll jumping */
        .quill-editor-container .ql-container {
          overflow: auto;
          height: calc(100% - 42px); /* Adjust for toolbar */
        }
        
        /* Hide scrollbars but keep functionality */
        .quill-editor-container .ql-editor {
          height: 100%;
          overflow-y: auto;
        }
        
        /* Fix for focus issues */
        .quill-editor-container .ql-editor:focus {
          outline: none;
        }
      `}</style>
      
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        className={`${className} h-full`}
        theme={readOnly ? 'bubble' : 'snow'}
        readOnly={readOnly}
        style={{
          background: readOnly ? "transparent" : "#fff",
          height: "100%",
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
