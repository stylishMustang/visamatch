import { BuiltUsingTools } from '@/components/home/footer/built-using-tools';
import { PoweredByPaddle } from '@/components/home/footer/powered-by-paddle';
// import { PriceCards } from '@/components/home/pricing/price-cards';
// import Pricing from '../header/Pricing';

export function Footer() {
  return (
    <>
      <BuiltUsingTools />
      <PoweredByPaddle />
      {/* <div id="#">
      <Pricing country={'USA'} />
        </div> */}
    </>
  );
}
