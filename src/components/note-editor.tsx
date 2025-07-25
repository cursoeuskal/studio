'use client';
import type { Note } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TagInput } from './tag-input';
import { suggestTags } from '@/ai/flows/suggest-tags';
import { summarizeNote } from '@/ai/flows/summarize-note-flow';
import React, { useState, useTransition, useEffect, useRef } from 'react';
import { BookText, Loader2, Sparkles, FileQuestion } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from './ui/scroll-area';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (note: Partial<Note> & { id: string }) => void;
}

export function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const { toast } = useToast();
  const [isSuggestingTags, startTagSuggestion] = useTransition();
  const [isSummarizing, startSummarization] = useTransition();
  const [summary, setSummary] = useState('');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note && titleRef.current) {
      titleRef.current.value = note.title;
    }
    if (note && contentRef.current) {
      contentRef.current.value = note.content;
    }
    if(editorRef.current){
      editorRef.current.scrollTop = 0;
    }
  }, [note]);

  const handleSuggestTags = () => {
    if (!note || !note.content) {
      toast({
        title: "Cannot suggest tags",
        description: "Please add some content to your note first.",
        variant: "destructive",
      });
      return;
    }

    startTagSuggestion(async () => {
      try {
        const result = await suggestTags({ noteContent: note.content });
        const newTags = result.tags.filter(tag => !note.tags.includes(tag.toLowerCase()));
        onUpdateNote({ id: note.id, tags: [...note.tags, ...newTags] });
        toast({
            title: "Tags suggested!",
            description: "New tags have been added to your note.",
        });
      } catch (error) {
        toast({
          title: "AI Error",
          description: "Failed to suggest tags. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleSummarize = () => {
    if (!note || !note.content) {
      toast({
        title: "Cannot summarize note",
        description: "Please add some content to your note first.",
        variant: "destructive",
      });
      return;
    }
    startSummarization(async () => {
        try {
            const result = await summarizeNote({ noteContent: note.content });
            setSummary(result.summary);
            setShowSummaryDialog(true);
        } catch (error) {
            toast({
                title: "AI Error",
                description: "Failed to summarize note. Please try again.",
                variant: "destructive",
            });
        }
    });
  };

  const handleInputChange = (field: 'title' | 'content', value: string) => {
    if(note) {
      onUpdateNote({id: note.id, [field]: value});
    }
  };

  if (!note) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background p-8">
        <div className="text-center">
            <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-2xl font-semibold">No Note Selected</h2>
            <p className="mt-2 text-muted-foreground">Create a new note or select one from the list to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 md:p-6 bg-background">
      <Card className="flex-1 flex flex-col h-full overflow-hidden shadow-none border-none">
        <CardHeader className="flex-row items-center justify-between p-4 border-b">
            <CardTitle className="flex-1">
                <Input
                    ref={titleRef}
                    defaultValue={note.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Note Title"
                    className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent"
                />
            </CardTitle>
            <div className="flex gap-2">
                <Button onClick={handleSummarize} disabled={isSummarizing || !note.content}>
                    {isSummarizing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <BookText className="mr-2 h-4 w-4" />
                    )}
                    Summarize
                </Button>
            </div>
        </CardHeader>
        <ScrollArea className="flex-1" ref={editorRef}>
            <CardContent className="p-4 h-full">
            <Textarea
                ref={contentRef}
                defaultValue={note.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Start writing your note here..."
                className="flex-1 w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed p-0 bg-transparent"
            />
            </CardContent>
        </ScrollArea>
        <CardFooter className="p-4 flex flex-col items-start gap-4 border-t">
            <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <Button variant="outline" size="sm" onClick={handleSuggestTags} disabled={isSuggestingTags || !note.content}>
                        {isSuggestingTags ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Suggest Tags
                    </Button>
                </div>
                <TagInput
                    value={note.tags}
                    onChange={(newTags) => onUpdateNote({ id: note.id, tags: newTags })}
                />
            </div>
        </CardFooter>
      </Card>

      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><BookText /> Note Summary</DialogTitle>
            <DialogDescription>
              Here is an AI-generated summary of your note.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] my-4">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-body p-1">{summary}</pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
