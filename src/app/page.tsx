'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NoteSidebar } from '@/components/note-sidebar';
import { NoteEditor } from '@/components/note-editor';
import type { Note, Folder } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"


export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('firebasenotes-notes');
      const storedFolders = localStorage.getItem('firebasenotes-folders');
      
      if (storedFolders) {
        const parsedFolders: Folder[] = JSON.parse(storedFolders);
        setFolders(parsedFolders);
      }

      if (storedNotes) {
        const parsedNotes: Note[] = JSON.parse(storedNotes);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
          const sortedNotes = [...parsedNotes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setActiveNoteId(sortedNotes[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        title: "Error",
        description: "Failed to load data from your browser's storage.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('firebasenotes-notes', JSON.stringify(notes));
        localStorage.setItem('firebasenotes-folders', JSON.stringify(folders));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
         toast({
          title: "Error",
          description: "Failed to save your notes. Your changes may not persist.",
          variant: "destructive",
        });
      }
    }
  }, [notes, folders, isLoading, toast]);
  
  const handleNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderId: selectedFolderId,
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setSelectedTag(null);
    if(isMobile) setSidebarOpen(false);
  }, [isMobile, selectedFolderId]);

  const handleNewFolder = useCallback((folderName: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: folderName,
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id);
  }, []);

  const handleDeleteFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setNotes(prev => prev.map(n => n.folderId === folderId ? { ...n, folderId: null } : n));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  }, [selectedFolderId]);

  const handleSelectNote = useCallback((id: string) => {
    setActiveNoteId(id);
    if(isMobile) setSidebarOpen(false);
  }, [isMobile]);
  
  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const newNotes = prev.filter(note => note.id !== id);
      if (activeNoteId === id) {
        const sortedNotes = [...newNotes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setActiveNoteId(sortedNotes.length > 0 ? sortedNotes[0].id : null);
      }
      return newNotes;
    });
  }, [activeNoteId]);

  const handleUpdateNote = useCallback((updatedNote: Partial<Note> & { id: string }) => {
    setNotes(prev => 
      prev.map(note =>
        note.id === updatedNote.id ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() } : note
      )
    );
  }, []);

  const handleSelectTag = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    setSelectedFolderId(null); 
    const notesForTag = tag ? notes.filter(note => note.tags.includes(tag)) : notes;
    const sortedNotes = [...notesForTag].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setActiveNoteId(sortedNotes.length > 0 ? sortedNotes[0].id : null);
  }, [notes]);
  
  const handleSelectFolder = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
    setSelectedTag(null);
  }, []);
  
  const handleMoveNoteToFolder = useCallback((noteId: string, folderId: string | null) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, folderId: folderId, updatedAt: new Date().toISOString() } : n));
  }, []);


  const filteredNotes = useMemo(() => {
    let notesToFilter = [...notes];
    if (selectedFolderId) {
      notesToFilter = notesToFilter.filter(note => note.folderId === selectedFolderId);
    } else if (selectedTag) {
      notesToFilter = notesToFilter.filter(note => note.tags.includes(selectedTag));
    }
    return notesToFilter.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, selectedTag, selectedFolderId]);

  const activeNote = useMemo(() => {
    return notes.find(note => note.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [notes]);

  const sidebarContent = (
    <NoteSidebar
      notes={filteredNotes}
      folders={folders}
      tags={allTags}
      activeNoteId={activeNoteId}
      selectedTag={selectedTag}
      selectedFolderId={selectedFolderId}
      onNewNote={handleNewNote}
      onSelectNote={handleSelectNote}
      onDeleteNote={handleDeleteNote}
      onSelectTag={handleSelectTag}
      onNewFolder={handleNewFolder}
      onSelectFolder={handleSelectFolder}
      onDeleteFolder={handleDeleteFolder}
      onMoveNoteToFolder={handleMoveNoteToFolder}
    />
  );
  
  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-8 h-8 text-primary animate-pulse" />
                <h1 className="text-2xl font-bold font-headline animate-pulse">FirebaseNotes</h1>
            </div>
        </div>
    );
  }

  return (
    <main className="h-screen w-full flex bg-background">
      {isMobile ? (
        <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-full shadow-md">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[300px] sm:w-[350px] border-none">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-[320px] shrink-0 h-full">
          {sidebarContent}
        </div>
      )}
      <div className="flex-1 h-full overflow-hidden">
        <NoteEditor 
          note={activeNote} 
          onUpdateNote={handleUpdateNote}
          folders={folders} 
        />
      </div>
    </main>
  );
}
