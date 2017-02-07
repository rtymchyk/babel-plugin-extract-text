class Demo extends React.Component {
  render() {
    const { locale } = this.context.locale;

    const numPeople = 100;
    const singular = _('Hey!', locale);
    const plural = _n('One person invited!', 'Lots of people invited!', numPeople, locale);
    const singularComplex = _c('Crack', 'Drug', locale);
    const pluralComplex = _nc('One cat!', 'So many cats!', numPeople, 'Animals', locale);

    const numCats = 5000;
    const catsFormatted = '5,000';

    return (
      <span>
        <LocalizedString id="Hello World!" />
        <LocalizedString
          id="You have just {cats} cat."
          idPlural="You have so many {cats}!"
          comment="On the browser page"
          count={numCats}
          cats={catsFormatted} />
        <LocalizedString id="Flag" context="Physical"/>
      </span>
    );
  }
}
