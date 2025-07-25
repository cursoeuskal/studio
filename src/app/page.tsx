'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NoteSidebar } from '@/components/note-sidebar';
import { NoteEditor } from '@/components/note-editor';
import type { Note } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, BookOpen } from 'lucide-react';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('notozen-notes');
      if (storedNotes) {
        const parsedNotes: Note[] = JSON.parse(storedNotes);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
          const sortedNotes = [...parsedNotes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setActiveNoteId(sortedNotes[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('notozen-notes', JSON.stringify(notes));
      } catch (error) {
        console.error("Failed to save notes to localStorage", error);
      }
    }
  }, [notes, isLoading]);
  
  const handleNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setSelectedTag(null);
    if(isMobile) setSidebarOpen(false);
  }, [isMobile]);

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
    const notesForTag = tag ? notes.filter(note => note.tags.includes(tag)) : notes;
    const sortedNotes = [...notesForTag].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setActiveNoteId(sortedNotes.length > 0 ? sortedNotes[0].id : null);

  }, [notes]);

  const filteredNotes = useMemo(() => {
    const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (!selectedTag) return sortedNotes;
    return sortedNotes.filter(note => note.tags.includes(selectedTag));
  }, [notes, selectedTag]);

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
      tags={allTags}
      activeNoteId={activeNoteId}
      selectedTag={selectedTag}
      onNewNote={handleNewNote}
      onSelectNote={handleSelectNote}
      onDeleteNote={handleDeleteNote}
      onSelectTag={handleSelectTag}
    />
  );
  
  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-8 h-8 text-primary animate-pulse" />
                <h1 className="text-2xl font-bold font-headline animate-pulse">NoteZen</h1>
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
        <NoteEditor note={activeNote} onUpdateNote={handleUpdateNote} />
      </div>
    </main>
  );
}
