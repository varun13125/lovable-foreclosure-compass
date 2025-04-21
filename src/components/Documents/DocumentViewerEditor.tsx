
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
  const isUpdatingRef = useRef(false);

  // Improved Cursor Position Management
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
      if (isUpdatingRef.current) return; // Don't restore during updates

      const selection = window.getSelection();
      if (!selection) return;
      
      const range = document.createRange();
      
      let charIndex = 0;
      let foundStart = false;
      let foundEnd = false;
      
      const traverseNodes = function(node: Node) {
        if (foundStart && foundEnd) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const nextCharIndex = charIndex + (node.textContent?.length || 0);
          
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

      try {
        traverseNodes(editorRef.current);
        
        // Only set the selection if we found both start and end points
        if (foundStart && foundEnd) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        console.error("Error restoring selection:", error);
      }
    }
  };

  // Debounced content update with increased delay for better performance
  const debouncedOnChange = useCallback(
    debounce((newContent: string) => {
      onChange(newContent);
    }, 500),
    [onChange]
  );

  // Handle content changes with improved cursor management
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    // Save selection before any updates
    selectionStateRef.current = CursorManager.save();
    
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
    debouncedOnChange(newContent);
  }, [debouncedOnChange]);

  // Enhanced MutationObserver setup with better event handling
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      if (isUpdatingRef.current) return;
      
      const hasContentChanged = mutations.some(mutation => 
        mutation.type === 'characterData' || 
        mutation.type === 'childList'
      );
      
      if (hasContentChanged) {
        const cursorPosition = CursorManager.save();
        if (cursorPosition) {
          selectionStateRef.current = cursorPosition;
        }
      }
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

  // Restore cursor position after render with improved timing
  useEffect(() => {
    if (selectionStateRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully updated
      const restoreFrame = requestAnimationFrame(() => {
        isUpdatingRef.current = true;
        CursorManager.restore(selectionStateRef.current);
        isUpdatingRef.current = false;
      });
      
      return () => cancelAnimationFrame(restoreFrame);
    }
  }, [content]);

  // Set initial content with content containment to prevent layout shifts
  useEffect(() => {
    if (value !== content && editorRef.current) {
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = value;
      setContent(value);
      isUpdatingRef.current = false;
    }
  }, [value]);

  // Enhanced key event handling with better modifier key support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      
      // Save cursor position after enter key
      setTimeout(() => {
        selectionStateRef.current = CursorManager.save();
      }, 0);
      
      return false;
    }
    return true;
  }, []);

  // Prevent focus loss which can cause cursor jumping
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Only if the related target is outside our editor
    if (editorRef.current && !editorRef.current.contains(e.relatedTarget as Node)) {
      selectionStateRef.current = CursorManager.save();
    }
  }, []);

  return (
    <div 
      className="fixed-height-container" 
      style={{ 
        height: "70vh", 
        overflow: "hidden", 
        position: "relative",
        contain: "content" // CSS containment to prevent layout shifts
      }}
    >
      <div 
        className="editor-container" 
        style={{ 
          height: "100%", 
          position: "relative",
          contain: "content"
        }}
      >
        <div
          ref={editorRef}
          className="document-editor"
          contentEditable={true}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          dangerouslySetInnerHTML={{ __html: content }}
          suppressContentEditableWarning={true}
          style={{
            width: "100%",
            height: "100%",
            padding: "1rem",
            outline: "none",
            overflowY: "auto",
            lineHeight: "1.5",
            fontFamily: "inherit",
            contain: "content", // CSS containment for better performance
            position: "relative" // Helps with positioning calculations
          }}
          role="textbox"
          aria-multiline="true"
          aria-label="Document editor"
          data-gramm="false" // Prevent Grammarly from interfering
        />
      </div>
    </div>
  );
};

export default DocumentViewerEditor;
