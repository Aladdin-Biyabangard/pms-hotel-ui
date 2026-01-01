import {RateTierForm} from '../forms/RateTierForm';
import {RateTierResponse} from '../api/rateTiers.api';

interface RateTierEditProps {
  tier: RateTierResponse | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RateTierEdit({
  tier,
  open,
  onClose,
  onSuccess
}: RateTierEditProps) {
  return (
    <RateTierForm
      initialData={tier}
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      defaultRatePlanId={tier?.ratePlanId}
    />
  );
}
