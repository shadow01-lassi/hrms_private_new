import React, { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TipTapToolbar from "./tiptap-toolbar";
import TextAlign from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import Code from '@tiptap/extension-code'
import Link from '@tiptap/extension-link';
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import CustomImage from "./custom-image";
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import FloatingBubbleMenu from "./floating-bubble-menu";
import WordCounter from "./word-counter";

interface TipTapEditorProps {
    content: string;
    setEditorContent: React.Dispatch<React.SetStateAction<string>>;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
    setEditorContent,
    content,
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right"],
                defaultAlignment: 'left',
            }),
            Image,
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    class: 'my-custom-class',
                },
            }),
            TextStyle,
            Color,
            Youtube.configure({
                controls: false,
                nocookie: true,
                modestBranding: true,
                autoplay: false,
            }),
            Code.configure({
                HTMLAttributes: {
                    class: 'my-custom-class',
                },
            }),
            Link.configure({
                openOnClick: true,  // Opens the link when clicked
                autolink: true,  // Auto-detects links and makes them clickable
                linkOnPaste: true,  // Automatically converts pasted URLs into links
                HTMLAttributes: {
                    rel: "noopener noreferrer",  // Security attributes
                    target: "_blank",  // Opens link in a new tab
                    class: "text-blue-500 underline hover:text-blue-700",  // Styling
                },
            }),
            HorizontalRule,
            CustomImage, // 🖼 New Image extension with toolbar
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: "my-table"
                },
            }),
            TableRow,
            TableHeader,
            TableCell,

        ],
        content: "start typing", // ✅ Use the passed content as initial value
        // onUpdate: ({ editor }) => {
        //   setEditorContent(editor.getHTML()); // ✅ Update state with new content
        // },
        onUpdate: ({ editor }) => {
            const newContent = editor.getHTML();

            // Check if content has changed before updating
            setEditorContent((prevContent) => (prevContent !== newContent ? newContent : prevContent));
        },
    });


    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            editor.commands.setContent(content, false); // ✅ Ensure editor updates with new content
        }
    }, [content, editor]); // Update when content changes

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === " ") {
            setEditorContent(editor?.getHTML() ?? ""); // Force state update
        }
    };


    const toggleEditing = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor) {
            return
        }
        const { checked } = e.target

        editor.setEditable(!checked, true)
        editor.view.dispatch(editor.view.state.tr.scrollIntoView())
    }, [editor]);


    return (
        <div>
            <div className="space-y-6">
                {/* Editor Section */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Content</label>
                        <div className="flex items-center space-x-2">
                            <label className="inline-flex items-center text-sm">
                                <input
                                    type="checkbox"
                                    checked={!editor?.isEditable}
                                    onChange={toggleEditing}
                                    className="rounded  mr-2"
                                />
                                Read-only mode
                            </label>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="border rounded-t-lg">
                        <TipTapToolbar editor={editor} />
                    </div>

                    {/* Editor Content */}
                    <div className="min-h-[40vh] h-full p-4 border border-t-0 rounded-b-lg shadow-inner overflow-y-auto">
                        <WordCounter editor={editor} />
                        <EditorContent
                            editor={editor}
                            onKeyDown={handleKeyDown}
                            className="prose max-w-none w-full h-full focus:outline-none leading-relaxed text-foreground"
                        />
                        <FloatingBubbleMenu editor={editor} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TipTapEditor;