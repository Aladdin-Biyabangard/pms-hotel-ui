import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {GuestResponse} from '@/api/guests';
import {format} from 'date-fns';
import {Building, Calendar, CreditCard, FileText, Gift, Globe, Heart, Mail, MapPin, Phone, User} from 'lucide-react';

interface GuestDetailsProps {
    guest: GuestResponse;
}

export const GuestDetails: React.FC<GuestDetailsProps> = ({ guest }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">
                                    {guest.firstName} {guest.lastName}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Guest ID: {guest.id}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {guest.loyaltyMember && (
                                <Badge variant="default" className="text-sm">
                                    <Gift className="h-3 w-3 mr-1" />
                                    Loyalty Member
                                </Badge>
                            )}
                            {guest.guestType && (
                                <Badge variant="outline" className="text-sm">
                                    {guest.guestType.replace('_', ' ')}
                                </Badge>
                            )}
                            {guest.status && (
                                <Badge 
                                    variant={guest.status === 'ACTIVE' ? 'default' : 'secondary'}
                                    className="text-sm"
                                >
                                    {guest.status}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {guest.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{guest.email}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{guest.phone}</p>
                                </div>
                            </div>
                            {guest.alternatePhone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Alternate Phone</p>
                                        <p className="font-medium">{guest.alternatePhone}</p>
                                    </div>
                                </div>
                            )}
                            {guest.dateOfBirth && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">{formatDate(guest.dateOfBirth)}</p>
                                    </div>
                                </div>
                            )}
                            {guest.nationality && (
                                <div className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nationality</p>
                                        <p className="font-medium">{guest.nationality}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            {(guest.address || guest.city || guest.state || guest.country) && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium">
                                            {[guest.address, guest.city, guest.state, guest.country, guest.zipCode]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {guest.guestType && (
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Guest Type</p>
                                        <p className="font-medium">{guest.guestType.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            )}
                            {guest.preferredLanguage && (
                                <div className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Preferred Language</p>
                                        <p className="font-medium">{guest.preferredLanguage}</p>
                                    </div>
                                </div>
                            )}
                            {guest.dietaryPreferences && (
                                <div className="flex items-center gap-3">
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dietary Preferences</p>
                                        <p className="font-medium">{guest.dietaryPreferences}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Identification */}
            {(guest.passportNumber || guest.idNumber) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Identification
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {guest.passportNumber && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Passport Number</p>
                                    <p className="font-medium">{guest.passportNumber}</p>
                                    {guest.passportExpiryDate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Expires: {formatDate(guest.passportExpiryDate)}
                                        </p>
                                    )}
                                </div>
                            )}
                            {guest.idNumber && (
                                <div>
                                    <p className="text-sm text-muted-foreground">ID Number</p>
                                    <p className="font-medium">{guest.idNumber}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loyalty Program */}
            {guest.loyaltyMember && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5" />
                            Loyalty Program
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {guest.loyaltyPoints !== undefined && guest.loyaltyPoints !== null && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Loyalty Points</p>
                                    <p className="font-medium text-2xl">{guest.loyaltyPoints.toLocaleString()}</p>
                                </div>
                            )}
                            {guest.loyaltyTier && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Loyalty Tier</p>
                                    <p className="font-medium">{guest.loyaltyTier}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Corporate Information */}
            {(guest.companyName || guest.companyAddress || guest.taxId) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Corporate Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {guest.companyName && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Company Name</p>
                                    <p className="font-medium">{guest.companyName}</p>
                                </div>
                            )}
                            {guest.companyAddress && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Company Address</p>
                                    <p className="font-medium">{guest.companyAddress}</p>
                                </div>
                            )}
                            {guest.taxId && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Tax ID</p>
                                    <p className="font-medium">{guest.taxId}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Special Needs & Notes */}
            {(guest.specialNeeds || guest.notes) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Additional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {guest.specialNeeds && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Special Needs</p>
                                    <p className="font-medium whitespace-pre-wrap">{guest.specialNeeds}</p>
                                </div>
                            )}
                            {guest.notes && (
                                <>
                                    {guest.specialNeeds && <Separator />}
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Notes</p>
                                        <p className="font-medium whitespace-pre-wrap">{guest.notes}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-muted-foreground">Created At</p>
                            <p className="font-medium">{formatDate(guest.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Last Updated</p>
                            <p className="font-medium">{formatDate(guest.updatedAt)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

