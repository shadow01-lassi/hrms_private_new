import React, { useState, useEffect, useRef, useCallback } from "react";
import { DraftHandleValue } from 'draft-js';

import { debounce } from "lodash";
import "draft-js/dist/Draft.css";
import {
    Editor,
    EditorState,
    RichUtils,
    convertToRaw,
    Modifier,
    getDefaultKeyBinding,
    KeyBindingUtil,
    ContentState
} from "draft-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

import {
    Bold,
    Code,
    Copy,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Text,
    Trash2,
    Underline,
    Undo
} from "lucide-react";

type wEditType = {
    setTextArea: (text: string) => void;
    preText: string;
};

const MAX_CHARACTERS = 4096;

const UNICODE_STYLES = {
    BOLD: {
        name: "Bold",
        chars: {
            a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
            k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
            u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
            A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝",
            K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧",
            U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
            0: "𝟬", 1: "𝟭", 2: "𝟮", 3: "𝟯", 4: "𝟰", 5: "𝟱", 6: "𝟲", 7: "𝟳", 8: "𝟴", 9: "𝟵"
        }
    },
    ITALIC: {
        name: "Italic",
        chars: {
            a: "𝘢", b: "𝘣", c: "𝘤", d: "𝘥", e: "𝘦", f: "𝘧", g: "𝘨", h: "𝘩", i: "𝘪", j: "𝘫",
            k: "𝘬", l: "𝘭", m: "𝘮", n: "𝘯", o: "𝘰", p: "𝘱", q: "𝘲", r: "𝘳", s: "𝘴", t: "𝘵",
            u: "𝘶", v: "𝘷", w: "𝘸", x: "𝘹", y: "𝘺", z: "𝘻",
            A: "𝘈", B: "𝘉", C: "𝘊", D: "𝘋", E: "𝘌", F: "𝘍", G: "𝘎", H: "𝘏", I: "𝘐", J: "𝘑",
            K: "𝘒", L: "𝘓", M: "𝘔", N: "𝘕", O: "𝘖", P: "𝘗", Q: "𝘘", R: "𝘙", S: "𝘚", T: "𝘛",
            U: "𝘜", V: "𝘝", W: "𝘞", X: "𝘟", Y: "𝘠", Z: "𝘡"
        }
    },
    BOLD_ITALIC: {
        name: "Bold Italic",
        chars: {
            a: "𝙖", b: "𝙗", c: "𝙘", d: "𝙙", e: "𝙚", f: "𝙛", g: "𝙜", h: "𝙝", i: "𝙞", j: "𝙟",
            k: "𝙠", l: "𝙡", m: "𝙢", n: "𝙣", o: "𝙤", p: "𝙥", q: "𝙦", r: "𝙧", s: "𝙨", t: "𝙩",
            u: "𝙪", v: "𝙫", w: "𝙬", x: "𝙭", y: "𝙮", z: "𝙯",
            A: "𝘼", B: "𝘽", C: "𝘾", D: "𝘿", E: "𝙀", F: "𝙁", G: "𝙂", H: "𝙃", I: "𝙄", J: "𝙅",
            K: "𝙆", L: "𝙇", M: "𝙈", N: "𝙉", O: "𝙊", P: "𝙋", Q: "𝙌", R: "𝙍", S: "𝙎", T: "𝙏",
            U: "𝙐", V: "𝙑", W: "𝙒", X: "𝙓", Y: "𝙔", Z: "𝙕"
        }
    }
};

const WAedit: React.FC<wEditType> = ({ setTextArea, preText }) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const editorRef = useRef<any>(null);
    const [textChange, onTextChange] = useState<string>("");

    console.log(textChange);


    // Initialize with preText
    useEffect(() => {
        const initialContent = ContentState.createFromText(preText);
        const newEditorState = EditorState.createWithContent(initialContent);
        setEditorState(newEditorState);
    }, [preText]);

    // Debounce text changes
    const debouncedTextChange = useCallback(
        debounce((text: string) => {
            onTextChange(text);
        }, 300),
        [onTextChange]
    );

    // Handle editor changes
    const handleEditorChange = (newState: EditorState) => {
        const contentState = newState.getCurrentContent();
        const plainText = contentState.getPlainText("");

        if (plainText.length > MAX_CHARACTERS) {
            toast.error(`Character limit exceeded! Max ${MAX_CHARACTERS} characters.`);
            return;
        }

        setEditorState(newState);
        const formatted = formatForWhatsApp(newState);
        setTextArea(formatted);
        debouncedTextChange(formatted);
    };

    // Format for WhatsApp with proper underscore handling
    const formatForWhatsApp = (editorState: EditorState) => {
        const content = editorState.getCurrentContent();
        const rawContent = convertToRaw(content);

        let numberedListCounter = 0;
        return rawContent.blocks.map((block, index) => {
            const text = block.text;
            let prefix = "";

            // Handle block types
            switch (block.type) {
                case "unordered-list-item":
                    prefix = "• ";
                    break;
                case "ordered-list-item":
                    if (index > 0 && rawContent.blocks[index - 1].type === "ordered-list-item") {
                        numberedListCounter++;
                    } else {
                        numberedListCounter = 1;
                    }
                    prefix = `${numberedListCounter}. `;
                    break;
                case "blockquote":
                    prefix = "> ";
                    break;
                default:
                    numberedListCounter = 0;
            }

            // Process styles
            const styleStack: Array<{ start: number; end: number; style: string }> = [];

            block.inlineStyleRanges.forEach(range => {
                let start = range.offset;
                let end = range.offset + range.length;

                // Skip whitespace at boundaries
                while (start < end && text[start] === " ") start++;
                while (end > start && text[end - 1] === " ") end--;

                if (end > start) {
                    styleStack.push({
                        start,
                        end,
                        style: range.style
                    });
                }
            });

            // Sort by start position (descending)
            styleStack.sort((a, b) => b.start - a.start);

            // Apply styles from innermost to outermost
            let modifiedText = text;
            styleStack.forEach(({ start, end, style }) => {
                const selectedText = modifiedText.slice(start, end);

                // Skip if text already contains formatting chars naturally
                if ((style === "ITALIC" && selectedText.includes("_")) ||
                    (style === "BOLD" && selectedText.includes("*")) ||
                    (style === "STRIKETHROUGH" && selectedText.includes("~"))) {
                    return;
                }

                let wrapper = "";
                switch (style) {
                    case "BOLD":
                        wrapper = "*";
                        break;
                    case "ITALIC":
                        wrapper = "_";
                        break;
                    case "STRIKETHROUGH":
                        wrapper = "~";
                        break;
                    case "CODE":
                        wrapper = "```";
                        break;
                    case "UNDERLINE": {
                        const underlined = selectedText.split("")
                            .map(c => c + "\u0332")
                            .join("");
                        modifiedText = modifiedText.slice(0, start) + underlined + modifiedText.slice(end);
                        return;
                    }
                    default:
                        return;
                }

                modifiedText = modifiedText.slice(0, start) + wrapper + selectedText + wrapper + modifiedText.slice(end);
            });

            return prefix + modifiedText;
        }).join("\n");
    };

    // Handle paste events
    const handlePastedText = (
        text: string,
        _html: string | undefined,
        editorState: EditorState
    ): DraftHandleValue => {
        const contentState = Modifier.insertText(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            text
        );
        const newState = EditorState.push(
            editorState,
            contentState,
            'insert-characters'
        );
        handleEditorChange(newState);
        return 'handled';
    };

    // Apply Unicode styles
    const applyUnicodeStyle = (styleName: string) => {
        const style = UNICODE_STYLES[styleName as keyof typeof UNICODE_STYLES];
        if (!style) return;

        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            const contentState = editorState.getCurrentContent();
            const selectedText = getSelectedText(editorState);
            let styledText = "";

            for (let i = 0; i < selectedText.length; i++) {
                const char = selectedText[i];
                styledText += style.chars[char as keyof typeof style.chars] || char;
            }

            const newContentState = Modifier.replaceText(
                contentState,
                selection,
                styledText
            );

            const newEditorState = EditorState.push(
                editorState,
                newContentState,
                "insert-characters"
            );

            handleEditorChange(newEditorState);
        }
    };

    // Helper functions
    const getSelectedText = (editorState: EditorState) => {
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        return contentState.getPlainText().slice(
            selection.getStartOffset(),
            selection.getEndOffset()
        );
    };

    const keyBindingFn = (e: React.KeyboardEvent) => {
        if (KeyBindingUtil.hasCommandModifier(e)) {
            switch (e.keyCode) {
                case 66: return "bold";
                case 73: return "italic";
                case 85: return e.shiftKey ? "strikethrough" : "underline";
                case 90: return e.shiftKey ? "redo" : "undo";
                default: break;
            }
        }
        return getDefaultKeyBinding(e);
    };

    const handleKeyCommand = (command: string) => {
        let newState;
        switch (command) {
            case "bold": newState = RichUtils.toggleInlineStyle(editorState, "BOLD"); break;
            case "italic": newState = RichUtils.toggleInlineStyle(editorState, "ITALIC"); break;
            case "strikethrough": newState = RichUtils.toggleInlineStyle(editorState, "STRIKETHROUGH"); break;
            case "underline": newState = RichUtils.toggleInlineStyle(editorState, "UNDERLINE"); break;
            case "undo": newState = EditorState.undo(editorState); break;
            case "redo": newState = EditorState.redo(editorState); break;
            default: return "not-handled";
        }
        if (newState) {
            handleEditorChange(newState);
            return "handled";
        }
        return "not-handled";
    };

    const applyStyle = (style: string) => {
        handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
    };

    const applyBlockType = (blockType: string) => {
        handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
    };

    const handleClearAll = () => {
        const newState = EditorState.createEmpty();
        setEditorState(newState);
        setTextArea("");
    };

    const copyToClipboard = () => {
        const formatted = formatForWhatsApp(editorState);
        navigator.clipboard.writeText(formatted).then(() => {
            toast.success("Copied to clipboard");
        });
    };

    return (
        <Card className="p-0 gap-0 overflow-hidden bg-muted">
            <CardHeader className="flex flex-wrap gap-2 bg-muted p-2 pb-0">
                <div className="flex flex-wrap gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyStyle("BOLD")}
                                className={editorState.getCurrentInlineStyle().has("BOLD") ? "bg-accent" : ""}
                            >
                                <Bold className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bold (⌘B)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyStyle("ITALIC")}
                                className={editorState.getCurrentInlineStyle().has("ITALIC") ? "bg-accent" : ""}
                            >
                                <Italic className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Italic (⌘I)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyStyle("UNDERLINE")}
                                className={editorState.getCurrentInlineStyle().has("UNDERLINE") ? "bg-accent" : ""}
                            >
                                <Underline className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Underline (⌘U)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyStyle("STRIKETHROUGH")}
                                className={editorState.getCurrentInlineStyle().has("STRIKETHROUGH") ? "bg-accent" : ""}
                            >
                                <Strikethrough className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Strikethrough (⌘⇧U)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyStyle("CODE")}
                                className={editorState.getCurrentInlineStyle().has("CODE") ? "bg-accent" : ""}
                            >
                                <Code className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Code</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <Text className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Unicode Styles</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => applyUnicodeStyle("BOLD")}>Bold</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => applyUnicodeStyle("ITALIC")}>Italic</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => applyUnicodeStyle("BOLD_ITALIC")}>Bold Italic</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyBlockType("unordered-list-item")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bullet List</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyBlockType("ordered-list-item")}
                            >
                                <ListOrdered className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Numbered List</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applyBlockType("blockquote")}
                            >
                                <Quote className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Quote</TooltipContent>
                    </Tooltip>
                </div>

                <div className="flex flex-wrap gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleKeyCommand("undo")}
                                disabled={editorState.getUndoStack().size === 0}
                            >
                                <Undo className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Undo (⌘Z)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleKeyCommand("redo")}
                                disabled={editorState.getRedoStack().size === 0}
                            >
                                <Redo className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear All</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy to Clipboard</TooltipContent>
                    </Tooltip>
                </div>
            </CardHeader>

            <CardContent className="border px-3 py-2 min-h-[100px] h-full bg-background rounded-lg m-2">
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={keyBindingFn}
                    handlePastedText={handlePastedText}
                    ref={editorRef}
                    placeholder="Start typing..."
                    spellCheck={true}
                    stripPastedStyles={false}
                />
            </CardContent>
        </Card>
    );
};

export default WAedit;