import {RateTierForm} from '../forms/RateTierForm';

interface RateTierCreateProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRatePlanId?: number;
}

export function RateTierCreate({
  open,
  onClose,
  onSuccess,
  defaultRatePlanId
}: RateTierCreateProps) {
  return (
    <RateTierForm
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      defaultRatePlanId={defaultRatePlanId}
    />
  );
}
