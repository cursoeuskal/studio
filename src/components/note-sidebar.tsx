'use client';
import type { Note, Folder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FilePlus, Trash2, Tag, BookOpen, Folder as FolderIcon, FolderPlus, MoreVertical } from 'lucide-react';
import React, { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from './ui/input';

interface NoteSidebarProps {
  notes: Note[];
  folders: Folder[];
  tags: string[];
  activeNoteId: string | null;
  selectedTag: string | null;
  selectedFolderId: string | null;
  onNewNote: () => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSelectTag: (tag: string | null) => void;
  onNewFolder: (name: string) => void;
  onSelectFolder: (id: string | null) => void;
  onDeleteFolder: (id: string) => void;
}

export function NoteSidebar({
  notes,
  folders,
  tags,
  activeNoteId,
  selectedTag,
  selectedFolderId,
  onNewNote,
  onSelectNote,
  onDeleteNote,
  onSelectTag,
  onNewFolder,
  onSelectFolder,
  onDeleteFolder
}: NoteSidebarProps) {
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onNewFolder(newFolderName.trim());
      setNewFolderName("");
      setShowNewFolderDialog(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-card text-card-foreground border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">FirebaseNotes</h1>
        </div>
        <Button onClick={onNewNote} className="w-full">
          <FilePlus className="mr-2 h-4 w-4" />
          Nueva nota
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold flex items-center text-muted-foreground"><FolderIcon className="mr-2 h-4 w-4" /> FOLDERS</h2>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewFolderDialog(true)}>
                    <FolderPlus className="h-4 w-4" />
                </Button>
            </div>
             <div className="space-y-1">
                <div
                    onClick={() => onSelectFolder(null)}
                    className={cn(
                    'group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm font-medium',
                    !selectedFolderId ? 'bg-primary/10' : 'hover:bg-muted/50'
                    )}
                >
                    <span>All Notes</span>
                </div>
                {folders.map(folder => (
                    <div
                        key={folder.id}
                        onClick={() => onSelectFolder(folder.id)}
                        className={cn(
                            'group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm',
                            selectedFolderId === folder.id ? 'bg-primary/10 font-semibold' : 'hover:bg-muted/50'
                        )}
                    >
                        <span className="truncate pr-2 flex-1">{folder.name}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the folder "{folder.name}"? Notes in this folder will not be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteFolder(folder.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-4 border-t">
            <h2 className="text-sm font-semibold mb-2 flex items-center text-muted-foreground"><Tag className="mr-2 h-4 w-4" /> TAGS</h2>
            <div className="flex flex-wrap gap-2">
            <Badge
                onClick={() => onSelectTag(null)}
                variant={!selectedTag && !selectedFolderId ? 'default' : 'secondary'}
                className="cursor-pointer transition-colors"
            >
                All Tags
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

        <div className="px-4 pb-4 space-y-2 border-t pt-4">
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
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <Input 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateFolder}>Create</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
