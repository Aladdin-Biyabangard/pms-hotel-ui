import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Calendar, MessageSquare, Star, User} from 'lucide-react';
import {ReviewStatus} from '@/types/enums';
import {format} from 'date-fns';

interface ReviewCardProps {
    review: {
        id: number;
        rating: number;
        comment?: string;
        guestName?: string;
        guestEmail?: string;
        reviewStatus: ReviewStatus;
        cleanlinessRating?: number;
        serviceRating?: number;
        valueRating?: number;
        locationRating?: number;
        createdAt: string;
        response?: string;
        responseDate?: string;
        helpfulCount?: number;
        isVerified?: boolean;
    };
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
    onRespond?: (id: number) => void;
    canManage?: boolean;
}

export function ReviewCard({ review, onApprove, onReject, onRespond, canManage = false }: ReviewCardProps) {
    const getStatusColor = (status: ReviewStatus) => {
        switch (status) {
            case ReviewStatus.APPROVED:
                return 'bg-green-500';
            case ReviewStatus.REJECTED:
                return 'bg-red-500';
            case ReviewStatus.FLAGGED:
                return 'bg-orange-500';
            default:
                return 'bg-yellow-500';
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {review.guestName || 'Anonymous'}
                            {review.isVerified && (
                                <Badge variant="outline" className="text-xs">
                                    Verified
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </CardDescription>
                    </div>
                    <Badge className={getStatusColor(review.reviewStatus)}>
                        {review.reviewStatus}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                        {review.cleanlinessRating && (
                            <div className="text-sm text-gray-600">
                                Cleanliness: {review.cleanlinessRating}/5
                            </div>
                        )}
                        {review.serviceRating && (
                            <div className="text-sm text-gray-600">
                                Service: {review.serviceRating}/5
                            </div>
                        )}
                        {review.valueRating && (
                            <div className="text-sm text-gray-600">
                                Value: {review.valueRating}/5
                            </div>
                        )}
                        {review.locationRating && (
                            <div className="text-sm text-gray-600">
                                Location: {review.locationRating}/5
                            </div>
                        )}
                    </div>

                    {review.comment && (
                        <div className="pt-2 border-t">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 mt-1 text-gray-400" />
                                <p className="text-sm text-gray-700">{review.comment}</p>
                            </div>
                        </div>
                    )}

                    {review.response && (
                        <div className="pt-2 border-t bg-blue-50 p-3 rounded">
                            <div className="text-xs font-semibold text-blue-700 mb-1">
                                Hotel Response
                            </div>
                            <p className="text-sm text-gray-700">{review.response}</p>
                            {review.responseDate && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {format(new Date(review.responseDate), 'MMM dd, yyyy')}
                                </div>
                            )}
                        </div>
                    )}

                    {review.helpfulCount !== undefined && review.helpfulCount > 0 && (
                        <div className="text-xs text-gray-500">
                            {review.helpfulCount} people found this helpful
                        </div>
                    )}

                    {canManage && review.reviewStatus === ReviewStatus.PENDING && (
                        <div className="flex gap-2 pt-2 border-t">
                            <button
                                onClick={() => onApprove?.(review.id)}
                                className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => onReject?.(review.id)}
                                className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onRespond?.(review.id)}
                                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Respond
                            </button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

