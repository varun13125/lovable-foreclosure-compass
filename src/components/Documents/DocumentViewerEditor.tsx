
import React, { useRef, useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";

interface DocumentViewerEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const DocumentViewerEditor: React.FC<DocumentViewerEditorProps> = ({
  value,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionStateRef = useRef<{ start: number; end: number; content: string } | null>(null);
  const [content, setContent] = useState(value);

  // Cursor Position Management
  const CursorManager = {
    save: () => {
      if (!editorRef.current) return null;
      
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return null;

      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(editorRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      
      return {
        start: preSelectionRange.toString().length,
        end: preSelectionRange.toString().length + range.toString().length,
        content: editorRef.current.innerHTML
      };
    },

    restore: (savedSelection: { start: number; end: number; content: string } | null) => {
      if (!savedSelection || !editorRef.current) return;

      const selection = window.getSelection();
      if (!selection) return;
      
      const range = document.createRange();
      
      let charIndex = 0;
      let foundStart = false;
      let foundEnd = false;
      
      const traverseNodes = function(node: Node) {
        if (foundStart && foundEnd) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const nextCharIndex = charIndex + node.textContent!.length;
          
          if (!foundStart && savedSelection.start >= charIndex && savedSelection.start <= nextCharIndex) {
            range.setStart(node, savedSelection.start - charIndex);
            foundStart = true;
          }
          
          if (!foundEnd && savedSelection.end >= charIndex && savedSelection.end <= nextCharIndex) {
            range.setEnd(node, savedSelection.end - charIndex);
            foundEnd = true;
          }
          
          charIndex = nextCharIndex;
        } else {
          Array.from(node.childNodes).forEach(traverseNodes);
        }
      };

      traverseNodes(editorRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Debounced content update
  const debouncedOnChange = useCallback(
    debounce((newContent: string) => {
      onChange(newContent);
    }, 300),
    [onChange]
  );

  // Handle content changes
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    selectionStateRef.current = CursorManager.save();
    setContent(newContent);
    debouncedOnChange(newContent);
  }, [debouncedOnChange]);

  // Setup MutationObserver
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        const cursorPosition = CursorManager.save();
        if (cursorPosition) {
          selectionStateRef.current = cursorPosition;
        }
      });
    });

    if (editorRef.current) {
      observer.observe(editorRef.current, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: false
      });
    }

    return () => observer.disconnect();
  }, []);

  // Restore cursor position after render
  useEffect(() => {
    if (selectionStateRef.current) {
      requestAnimationFrame(() => {
        CursorManager.restore(selectionStateRef.current);
      });
    }
  }, [content]);

  // Set initial content
  useEffect(() => {
    if (value !== content && editorRef.current) {
      editorRef.current.innerHTML = value;
      setContent(value);
    }
  }, [value]);

  // Handle special key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      return false;
    }
    return true;
  }, []);

  return (
    <div className="fixed-height-container" style={{ height: "70vh", overflow: "hidden", position: "relative" }}>
      <div className="editor-container" style={{ height: "100%", position: "relative" }}>
        <div
          ref={editorRef}
          className="document-editor"
          contentEditable={true}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          dangerouslySetInnerHTML={{ __html: content }}
          suppressContentEditableWarning={true}
          style={{
            width: "100%",
            height: "100%",
            padding: "1rem",
            outline: "none",
            overflowY: "auto",
            lineHeight: "1.5",
            fontFamily: "inherit"
          }}
          role="textbox"
          aria-multiline="true"
          aria-label="Document editor"
        />
      </div>
    </div>
  );
};

export default DocumentViewerEditor;
