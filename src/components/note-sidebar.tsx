'use client';
import type { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FilePlus, Trash2, Tag, BookOpen } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NoteSidebarProps {
  notes: Note[];
  tags: string[];
  activeNoteId: string | null;
  selectedTag: string | null;
  onNewNote: () => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSelectTag: (tag: string | null) => void;
}

export function NoteSidebar({
  notes,
  tags,
  activeNoteId,
  selectedTag,
  onNewNote,
  onSelectNote,
  onDeleteNote,
  onSelectTag,
}: NoteSidebarProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex h-full flex-col bg-card text-card-foreground border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">NoteZen</h1>
        </div>
        <Button onClick={onNewNote} className="w-full">
          <FilePlus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      <div className="p-4">
        <h2 className="text-sm font-semibold mb-2 flex items-center text-muted-foreground"><Tag className="mr-2 h-4 w-4" /> TAGS</h2>
        <div className="flex flex-wrap gap-2">
          <Badge
            onClick={() => onSelectTag(null)}
            variant={!selectedTag ? 'default' : 'secondary'}
            className="cursor-pointer transition-colors"
          >
            All Notes
          </Badge>
          {tags.map((tag) => (
            <Badge
              key={tag}
              onClick={() => onSelectTag(tag)}
              variant={selectedTag === tag ? 'default' : 'secondary'}
              className="cursor-pointer transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-4 pb-4 space-y-2">
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground p-4 text-sm">No notes found.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={cn(
                  'group p-3 rounded-lg cursor-pointer transition-colors',
                  activeNoteId === note.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                )}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold truncate pr-2 flex-1">{note.title || 'Untitled Note'}</h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the note titled "{note.title || 'Untitled Note'}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteNote(note.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-sm text-muted-foreground truncate">{note.content || 'No content'}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(note.updatedAt)}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
