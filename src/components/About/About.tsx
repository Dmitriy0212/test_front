import Image from 'next/image';
import css from './About.module.css';

export default function About() {
    return (
         <section className={css.about}>
      <div className={css.content}>
        <h2 className={css.title}>About us</h2>

        <p className={css.text}>
          Harmoniq is a mindful publishing platform dedicated to mental health
          and well-being. We bring together writers, thinkers, and readers who
          believe that open, thoughtful stories can heal, inspire, and connect.
          Whether you're here to share your journey or learn from others — this
          is your space to slow down, reflect, and grow.
        </p>
      </div>
<ul className={css.images}>
      <li className={css.lotus}>
        <Image
          src="/images/about-lotus.jpg"
          alt="Lotus flower"
          fill
          sizes="(max-width: 767px) 361px, (max-width: 1439px) 249px, 704px"
          className={css.img}
        />
      </li>

      <li className={css.community}>
        <Image
          src="/images/about-community.jpg"
          alt="People enjoying nature"
          fill
          sizes="(max-width: 767px) 361px, (max-width: 1439px) 704px, 808px"
          className={css.img}
        />
      </li>

      <li className={css.meditation}>
        <Image
          src="/images/about-meditation.jpg"
          alt="Person meditating"
          width={392}
          height={398}
          className={css.img}
        />
      </li>
      </ul>
    </section>
  );
}