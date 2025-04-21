
import React, { useRef, useEffect } from 'react';
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
  
  // Handle content change without losing focus
  const handleChange = (content: string) => {
    onChange(content);
  };
  
  // Fix scroll jumping issue
  useEffect(() => {
    if (!readOnly) {
      // Access the Quill editor instance
      const editor = quillRef.current?.getEditor();
      if (editor) {
        // Get the editor element
        const editorElement = editor.root;
        if (editorElement) {
          // Prevent scroll restoration behavior
          editorElement.setAttribute('tabindex', '0');
          
          // Prevent scroll jumping by handling the focus events
          const handleFocus = () => {
            // Store current scroll position when focusing
            const scrollPosition = window.scrollY;
            
            // Restore scroll position after a short delay
            setTimeout(() => {
              window.scrollTo({
                top: scrollPosition,
                behavior: 'auto'
              });
            }, 0);
          };
          
          editorElement.addEventListener('focus', handleFocus);
          
          // Clean up the event listener
          return () => {
            editorElement.removeEventListener('focus', handleFocus);
          };
        }
      }
    }
  }, [readOnly]);
  
  return (
    <div className="quill-container" style={{ 
      height: minHeight, 
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        className={`${className} flex-grow`}
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
