import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {Intro,cast,introCardAt,introDuration} from './Intro';
it('introduces eight named roles then a title without a narrator portrait',()=>{
 expect(introDuration).toBe(30);expect(cast).toHaveLength(8);
 cast.forEach((c,i)=>{expect(introCardAt(i*3+.1)).toEqual(c);const html=renderToStaticMarkup(<Intro time={i*3+.1} reduced/>);expect(html).toContain(c[1]);expect(html).toContain(c[2]);if(c[0]==='narrator')expect(html).not.toContain('intro-portrait');});
 expect(introCardAt(24)).toBeUndefined();expect(introCardAt(29.99)).toBeUndefined();expect(renderToStaticMarkup(<Intro time={24} reduced/>)).toContain('EIGHT MINUTES TO BLACKOUT');
});
