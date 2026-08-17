/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  AtSign,
  UserCheck,
} from 'lucide-react';
import { NoteService } from '../../services/note-service';
import { UserMention } from '../../types/activity-note-types';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange?: (mentions: UserMention[]) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  onMentionsChange,
  placeholder = 'Write internal team notes, record meeting outcomes, tag colleagues with @...',
  minHeight = '100px',
}: RichTextEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [mentionSearch, setMentionSearch] = React.useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = React.useState<UserMention[]>([]);
  const [selectedMentions, setSelectedMentions] = React.useState<UserMention[]>([]);
  const [mentionIndex, setMentionIndex] = React.useState<number>(-1);

  // Handle Mentions lookup
  React.useEffect(() => {
    if (mentionSearch !== null) {
      NoteService.fetchUserMentions(mentionSearch).then((list) => {
        setMentionSuggestions(list);
      });
    } else {
      setMentionSuggestions([]);
    }
  }, [mentionSearch]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChange(newVal);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newVal.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1) {
      const charBeforeAt = lastAtPos > 0 ? textBeforeCursor[lastAtPos - 1] : ' ';
      const query = textBeforeCursor.substring(lastAtPos + 1);
      if ((charBeforeAt === ' ' || charBeforeAt === '\n') && !query.includes(' ')) {
        setMentionSearch(query);
        setMentionIndex(lastAtPos);
        return;
      }
    }

    setMentionSearch(null);
  };

  const handleSelectMention = (user: UserMention) => {
    if (!textareaRef.current || mentionIndex === -1) return;

    const currentText = value;
    const cursorPos = textareaRef.current.selectionStart;
    const beforeMention = currentText.substring(0, mentionIndex);
    const afterMention = currentText.substring(cursorPos);

    const mentionTag = `@${user.fullName} `;
    const updatedText = `${beforeMention}${mentionTag}${afterMention}`;

    onChange(updatedText);

    if (!selectedMentions.some((m) => m.userId === user.userId)) {
      const updatedMentions = [...selectedMentions, user];
      setSelectedMentions(updatedMentions);
      onMentionsChange?.(updatedMentions);
    }

    setMentionSearch(null);
    setMentionIndex(-1);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = beforeMention.length + mentionTag.length;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 50);
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'ul' | 'ol' | 'link' | 'code' | 'quote') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';

    let formatted = selectedText;
    switch (format) {
      case 'bold':
        formatted = `**${selectedText}**`;
        break;
      case 'italic':
        formatted = `*${selectedText}*`;
        break;
      case 'underline':
        formatted = `<u>${selectedText}</u>`;
        break;
      case 'ul':
        formatted = `\n- ${selectedText}`;
        break;
      case 'ol':
        formatted = `\n1. ${selectedText}`;
        break;
      case 'link':
        formatted = `[${selectedText}](https://)`;
        break;
      case 'code':
        formatted = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      case 'quote':
        formatted = `\n> ${selectedText}`;
        break;
    }

    const updated = value.substring(0, start) + formatted + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formatted.length, start + formatted.length);
    }, 50);
  };

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all relative">
      {/* Editor Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-muted/50 border-b border-border text-muted-foreground text-xs">
        <button
          type="button"
          onClick={() => applyFormatting('bold')}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Bold (**text**)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormatting('italic')}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Italic (*text*)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormatting('underline')}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Underline (<u>text</u>)"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border my-auto mx-1" />

        <button
          type="button"
          onClick={() => applyFormatting('ul')}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Bullet List (- item)"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormatting('ol')}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Numbered List (1. item)"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border my-auto mx-1" />

        <button
          type="button"
          onClick={() => applyFormatting('link')}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Hyperlink ([text](url))"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormatting('code')}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Code Block (``` code ```)"
        >
          <Code className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormatting('quote')}
          className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Block Quote (> text)"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border my-auto mx-1" />

        <button
          type="button"
          onClick={() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              const pos = textareaRef.current.selectionStart;
              const val = value.substring(0, pos) + '@' + value.substring(pos);
              onChange(val);
              setMentionSearch('');
              setMentionIndex(pos);
            }
          }}
          className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center space-x-1 font-medium text-[11px]"
          title="Mention User (@name)"
        >
          <AtSign className="h-3.5 w-3.5" />
          <span>Mention</span>
        </button>
      </div>

      {/* Textarea Input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        style={{ minHeight }}
        className="w-full p-3 text-xs bg-transparent text-foreground focus:outline-none resize-y leading-relaxed font-normal"
      />

      {/* Tagged Mentions Indicator Chips */}
      {selectedMentions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2 pt-1 border-t border-border/40 text-[11px]">
          <span className="text-muted-foreground flex items-center space-x-1">
            <UserCheck className="h-3 w-3 text-primary" />
            <span>Mentioned:</span>
          </span>
          {selectedMentions.map((m) => (
            <span
              key={m.userId}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-[10px]"
            >
              <span>@{m.fullName}</span>
            </span>
          ))}
        </div>
      )}

      {/* Autocomplete User Mentions Popup Menu */}
      {mentionSearch !== null && mentionSuggestions.length > 0 && (
        <div className="absolute z-50 bottom-12 left-3 w-64 bg-popover border border-border shadow-md rounded-lg overflow-hidden py-1 max-h-48 overflow-y-auto text-xs">
          <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-muted-foreground bg-muted/40 border-b border-border/50">
            Mention Team Member
          </div>
          {mentionSuggestions.map((user) => (
            <button
              key={user.userId}
              type="button"
              onClick={() => handleSelectMention(user)}
              className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center justify-between transition-colors"
            >
              <div className="font-semibold text-foreground truncate">{user.fullName}</div>
              <div className="text-[10px] text-muted-foreground truncate ml-2">{user.email}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
