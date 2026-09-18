import { Button, type ButtonProps } from './Button';

export function ButtonPrimaryHero(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

export function ButtonGlassUtility(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="glass" {...props} />;
}

type ButtonNavCtaProps = Omit<ButtonProps, 'variant'> & {
  size?: 'default' | 'lg';
};

export function ButtonNavCta({ size = 'default', ...props }: ButtonNavCtaProps) {
  return (
    <Button
      variant={size === 'lg' ? 'nav-large' : 'nav-cta'}
      {...props}
    />
  );
}
