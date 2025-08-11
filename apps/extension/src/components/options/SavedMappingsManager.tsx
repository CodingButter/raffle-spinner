/**
 * Saved Mappings Manager Component
 *
 * Purpose: Manages saved CSV column mappings, allowing users to view, edit,
 * delete, and set default mappings for future CSV imports.
 */

import { useState, useEffect } from 'react';
import { storage, SavedMapping } from '@raffle-spinner/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Star, StarOff } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { helpContent } from '@/lib/help-content';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SavedMappingsManager() {
  const [mappings, setMappings] = useState<SavedMapping[]>([]);
  const [defaultMappingId, setDefaultMappingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedMapping | null>(null);
  const [editTarget, setEditTarget] = useState<SavedMapping | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    const saved = await storage.getSavedMappings();
    setMappings(saved);

    const defaultMapping = await storage.getDefaultMapping();
    setDefaultMappingId(defaultMapping?.id || null);
  };

  const handleSetDefault = async (mapping: SavedMapping) => {
    await storage.setDefaultMapping(mapping.id);
    setDefaultMappingId(mapping.id);

    // Update isDefault flag on all mappings
    const updatedMappings = mappings.map((m) => ({
      ...m,
      isDefault: m.id === mapping.id,
    }));

    // Save the updated mapping with isDefault flag
    await storage.saveSavedMapping({
      ...mapping,
      isDefault: true,
      usageCount: mapping.usageCount + 1,
    });

    setMappings(updatedMappings);
  };

  const handleRemoveDefault = async () => {
    await storage.setDefaultMapping(null);
    setDefaultMappingId(null);

    const updatedMappings = mappings.map((m) => ({
      ...m,
      isDefault: false,
    }));
    setMappings(updatedMappings);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    await storage.deleteSavedMapping(deleteTarget.id);
    setMappings(mappings.filter((m) => m.id !== deleteTarget.id));
    setDeleteTarget(null);

    if (deleteTarget.id === defaultMappingId) {
      setDefaultMappingId(null);
    }
  };

  const handleEditSave = async () => {
    if (!editTarget || !editName.trim()) return;

    const updated = {
      ...editTarget,
      name: editName.trim(),
      updatedAt: Date.now(),
    };

    await storage.saveSavedMapping(updated);
    setMappings(mappings.map((m) => (m.id === updated.id ? updated : m)));
    setEditTarget(null);
    setEditName('');
  };

  const formatMapping = (mapping: SavedMapping) => {
    const parts = [];
    if (mapping.mapping.fullName) {
      parts.push(`Full Name: ${mapping.mapping.fullName}`);
    } else {
      if (mapping.mapping.firstName) parts.push(`First: ${mapping.mapping.firstName}`);
      if (mapping.mapping.lastName) parts.push(`Last: ${mapping.mapping.lastName}`);
    }
    parts.push(`Ticket: ${mapping.mapping.ticketNumber}`);
    return parts.join(', ');
  };

  if (mappings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Saved Column Mappings
            <InfoTooltip {...helpContent.columnMapping.savedMappings} />
          </CardTitle>
          <CardDescription>
            No saved mappings yet. Mappings will appear here after you import CSVs.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Saved Column Mappings
            <InfoTooltip {...helpContent.columnMapping.savedMappings} />
          </CardTitle>
          <CardDescription>
            Manage your saved CSV column mappings. Set a default to auto-apply to new imports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mappings.map((mapping) => (
              <div
                key={mapping.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{mapping.name}</span>
                    {mapping.id === defaultMappingId && <Badge variant="secondary">Default</Badge>}
                    <Badge variant="outline" className="text-xs">
                      Used {mapping.usageCount} times
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{formatMapping(mapping)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {mapping.id === defaultMappingId ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveDefault}
                      title="Remove as default"
                    >
                      <StarOff className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetDefault(mapping)}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditTarget(mapping);
                      setEditName(mapping.name);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(mapping)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Name Dialog */}
      <AlertDialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Mapping Name</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mapping-name">Name</Label>
              <Input
                id="mapping-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter mapping name"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditName('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditSave}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
