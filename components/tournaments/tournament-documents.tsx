"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import type { TournamentDocument } from "@/lib/types/tournaments";
import { TournamentDocumentAddDialog } from "@/components/tournaments/tournament-document-add-dialog";
import { useDeleteTournamentDocument } from "@/lib/hooks/use-admin-tournaments";

interface TournamentDocumentsProps {
  tournamentId: string;
  documents: TournamentDocument[];
  isLoading?: boolean;
  isAdmin?: boolean;
}

function formatSize(size: number | null) {
  if (!size || size <= 0) return "—";
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} КБ`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} МБ`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} ГБ`;
}

export function TournamentDocuments({
  tournamentId,
  documents,
  isLoading = false,
  isAdmin = false,
}: TournamentDocumentsProps) {
  const deleteMutation = useDeleteTournamentDocument();
  const [addOpen, setAddOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Документы</CardTitle>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Добавить документ
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Загрузка...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Документов пока нет
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {doc.title}
                      </a>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatSize(doc.size)}
                      {doc.contentType ? ` • ${doc.contentType}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        Скачать
                      </a>
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() =>
                          deleteMutation.mutate({
                            tournamentId,
                            documentId: doc.id,
                          })
                        }
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {deleteMutation.error && (
                <div className="text-sm text-destructive">
                  {deleteMutation.error instanceof Error
                    ? deleteMutation.error.message
                    : "Ошибка при удалении документа"}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <TournamentDocumentAddDialog
          tournamentId={tournamentId}
          open={addOpen}
          onOpenChange={setAddOpen}
        />
      )}
    </>
  );
}

