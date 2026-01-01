import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Star} from 'lucide-react';

interface ReviewFormData {
    rating: number;
    comment?: string;
    cleanlinessRating?: number;
    serviceRating?: number;
    valueRating?: number;
    locationRating?: number;
    guestName?: string;
    guestEmail?: string;
    isAnonymous?: boolean;
}

interface ReviewFormProps {
    initialData?: ReviewFormData;
    onSubmit: (data: ReviewFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function ReviewForm({ initialData, onSubmit, onCancel, isLoading }: ReviewFormProps) {
    const [formData, setFormData] = useState<ReviewFormData>({
        rating: initialData?.rating || 5,
        comment: initialData?.comment || '',
        cleanlinessRating: initialData?.cleanlinessRating || 5,
        serviceRating: initialData?.serviceRating || 5,
        valueRating: initialData?.valueRating || 5,
        locationRating: initialData?.locationRating || 5,
        guestName: initialData?.guestName || '',
        guestEmail: initialData?.guestEmail || '',
        isAnonymous: initialData?.isAnonymous || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const renderStarRating = (
        label: string,
        value: number,
        onChange: (value: number) => void
    ) => {
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onChange(i + 1)}
                            className="focus:outline-none"
                        >
                            <Star
                                className={`h-6 w-6 ${
                                    i < value
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                } hover:text-yellow-400 transition-colors`}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-sm font-medium">{value}/5</span>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit Review</CardTitle>
                <CardDescription>Share your experience with us</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {renderStarRating('Overall Rating', formData.rating, (value) =>
                        setFormData({ ...formData, rating: value })
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {renderStarRating(
                            'Cleanliness',
                            formData.cleanlinessRating || 5,
                            (value) => setFormData({ ...formData, cleanlinessRating: value })
                        )}
                        {renderStarRating(
                            'Service',
                            formData.serviceRating || 5,
                            (value) => setFormData({ ...formData, serviceRating: value })
                        )}
                        {renderStarRating(
                            'Value',
                            formData.valueRating || 5,
                            (value) => setFormData({ ...formData, valueRating: value })
                        )}
                        {renderStarRating(
                            'Location',
                            formData.locationRating || 5,
                            (value) => setFormData({ ...formData, locationRating: value })
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea
                            id="comment"
                            value={formData.comment}
                            onChange={(e) =>
                                setFormData({ ...formData, comment: e.target.value })
                            }
                            rows={4}
                            placeholder="Tell us about your experience..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="guestName">Your Name</Label>
                            <Input
                                id="guestName"
                                value={formData.guestName}
                                onChange={(e) =>
                                    setFormData({ ...formData, guestName: e.target.value })
                                }
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guestEmail">Email</Label>
                            <Input
                                id="guestEmail"
                                type="email"
                                value={formData.guestEmail}
                                onChange={(e) =>
                                    setFormData({ ...formData, guestEmail: e.target.value })
                                }
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isAnonymous"
                            checked={formData.isAnonymous}
                            onChange={(e) =>
                                setFormData({ ...formData, isAnonymous: e.target.checked })
                            }
                            className="rounded"
                        />
                        <Label htmlFor="isAnonymous">Submit anonymously</Label>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

