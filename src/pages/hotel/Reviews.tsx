import {useEffect, useState} from 'react';
import {ReviewCard, ReviewForm} from '@/components/hotel';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Filter, Plus, Search} from 'lucide-react';
import {ReviewStatus, Role} from '@/types/enums';
import {useAuth} from '@/context/AuthContext';
import {hasAnyRole} from '@/utils/roleUtils';

export default function Reviews() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [ratingFilter, setRatingFilter] = useState<string>('ALL');

    const canManage = hasAnyRole(user?.roles || [], [
        Role.ADMIN,
        Role.MANAGER,
        Role.DIRECTOR,
    ]);

    useEffect(() => {
        loadReviews();
    }, [statusFilter, ratingFilter, searchTerm]);

    const loadReviews = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement API call
            // const response = await fetchReviews({ statusFilter, ratingFilter, searchTerm });
            // setReviews(response.data);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            // TODO: Implement API call
            // await approveReview(id);
            loadReviews();
        } catch (error) {
            console.error('Failed to approve review:', error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            // TODO: Implement API call
            // await rejectReview(id);
            loadReviews();
        } catch (error) {
            console.error('Failed to reject review:', error);
        }
    };

    const handleRespond = async (id: number) => {
        // TODO: Open response modal
        console.log('Respond to review:', id);
    };

    const handleSubmit = async (data: any) => {
        try {
            // TODO: Implement API call
            // await createReview(data);
            setShowForm(false);
            loadReviews();
        } catch (error) {
            console.error('Failed to submit review:', error);
        }
    };

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch =
            review.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'ALL' || review.reviewStatus === statusFilter;
        const matchesRating =
            ratingFilter === 'ALL' || review.rating === parseInt(ratingFilter);
        return matchesSearch && matchesStatus && matchesRating;
    });

    return (
        <PageWrapper title="Guest Reviews">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search reviews..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                {Object.values(ReviewStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Ratings</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {!canManage && (
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Write Review
                        </Button>
                    )}
                </div>

                {showForm && (
                    <ReviewForm
                        onSubmit={handleSubmit}
                        onCancel={() => setShowForm(false)}
                        isLoading={isLoading}
                    />
                )}

                {isLoading ? (
                    <div className="text-center py-8">Loading reviews...</div>
                ) : filteredReviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No reviews found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onApprove={canManage ? handleApprove : undefined}
                                onReject={canManage ? handleReject : undefined}
                                onRespond={canManage ? handleRespond : undefined}
                                canManage={canManage}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}

