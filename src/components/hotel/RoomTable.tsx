import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {RoomResponse} from '@/api/hotel';
import {RoomStatusBadge} from './RoomStatusBadge';
import {EntityStatusBadge} from './EntityStatusBadge';
import {Eye, Image as ImageIcon, Pencil, Trash2} from 'lucide-react';
import {Skeleton} from '@/components/ui/skeleton';
import {cn} from '@/lib/utils';

interface RoomTableProps {
    rooms: RoomResponse[];
    isLoading?: boolean;
    onEdit?: (room: RoomResponse) => void;
    onDelete?: (room: RoomResponse) => void;
    onView?: (room: RoomResponse) => void;
    onManageImages?: (room: RoomResponse) => void;
    canEdit?: boolean;
}

export const RoomTable: React.FC<RoomTableProps> = ({
    rooms,
    isLoading = false,
    onEdit,
    onDelete,
    onView,
    onManageImages,
    canEdit = false,
}) => {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Room Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Floor</TableHead>
                            <TableHead>Beds</TableHead>
                            <TableHead>Price/Night</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Room Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                No rooms found. Create your first room to get started.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Room Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Beds</TableHead>
                        <TableHead>Occupancy</TableHead>
                        <TableHead>Price/Night</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Room Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rooms.map((room) => (
                        <TableRow
                            key={room.id}
                            className={cn(
                                "hover:bg-muted/50 transition-colors",
                                room.status === 'INACTIVE' && "opacity-60"
                            )}
                        >
                            <TableCell className="font-medium">{room.roomNumber}</TableCell>
                            <TableCell>{room.roomType}</TableCell>
                            <TableCell>{room.floor}</TableCell>
                            <TableCell>{room.bedCount}</TableCell>
                            <TableCell>{room.occupancy || '-'}</TableCell>
                            <TableCell>${room.pricePerNight.toFixed(2)}</TableCell>
                            <TableCell>
                                <EntityStatusBadge status={room.status} />
                            </TableCell>
                            <TableCell>
                                {room.roomStatus ? (
                                    <RoomStatusBadge status={room.roomStatus} />
                                ) : (
                                    <span className="text-muted-foreground text-sm">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {onView && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onView(room)}
                                            title="View details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onManageImages && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onManageImages(room)}
                                            title="Manage images"
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {canEdit && onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(room)}
                                            title="Edit room"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {canEdit && onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(room)}
                                            title="Delete room"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

