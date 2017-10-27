export const t1Num = 1
export {default as t1FunFromT2Default} from './t2'

import {a1, a1 as a2, b1, b1 as b2, c1 as c2} from './t2'
import t2 from './t2'
import * as t3 from './t3'

export {t2 as t1FromT2Default, t3 as t1FromT3All, a1 as a11, a2 as a22, b1, b2, c2 as c1}

