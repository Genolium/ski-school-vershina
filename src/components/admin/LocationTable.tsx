import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { type Location } from "@/lib/api";

interface LocationTableProps {
  locations: Location[];
  onEdit: (location: Location) => void;
  onDelete: (id: number) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
  isReordering: boolean;
}

export const LocationTable = ({ locations, onEdit, onDelete, onReorder, isReordering }: LocationTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Название</TableHead>
          <TableHead>Адрес</TableHead>
          <TableHead>Описание</TableHead>
          <TableHead className="w-28 text-center">Порядок</TableHead>
          <TableHead>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              Локации не добавлены
            </TableCell>
          </TableRow>
        ) : (
          locations.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell>{item.description?.substring(0, 50)}...</TableCell>
              <TableCell className="text-center">
                <div className="inline-flex items-center gap-1 justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === 0 || isReordering}
                    onClick={() => onReorder(index, 'up')}
                    title="Поднять выше"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center font-mono text-sm font-semibold">
                    {item.order ?? 0}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === locations.length - 1 || isReordering}
                    onClick={() => onReorder(index, 'down')}
                    title="Опустить ниже"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                    Редактировать
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Удалить</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить локацию?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive">
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

