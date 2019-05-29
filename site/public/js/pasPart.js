function getRandomInt(min, max){
  return Math.floor( Math.random() * ( max - min ) ) + min;
}

function randomSlyllables( length, spaceProbability, punctuationProbability, upperCaseProbablity ){
  let slyllables = [ 
    'а', 'я', 'э', 'е', 'о', 'ё', 'ы', 'и', 'у', 'ю', 'б', 'в', 'г',
    'ж', 'д', 'з', 'к', 'л', 'м', 'н', 'п', 'р', 'с', 'т', 'ф', 'х',
    'ш', 'ц', 'щ',
    'на', 'ну', 'но', 'ны', 'ни', 'не', 'ня', 'нё', 'ню', 'нэ', 'нь',
    'ма', 'му', 'мо', 'мы', 'ми', 'ме', 'мя', 'мё', 'мю', 'мэ', 'мь',
    'та', 'ту', 'то', 'ты', 'ти', 'те', 'тя', 'тё', 'тю', 'тэ', 'ть',
    'ка', 'ку', 'ко', 'ки', 'ке', 'кэ', 'кь',
    'ха', 'ху', 'хо', 'хи', 'хе', 'хэ', 'хь',
    'ба', 'бу', 'бо', 'бы', 'би', 'бе', 'бя', 'бё', 'бю', 'бэ', 'бь',
    'ва', 'ву', 'во', 'вы', 'ви', 'ве', 'вя', 'вё', 'вю', 'вэ', 'вь',
    'га', 'гу', 'го', 'ги', 'ге', 'гэ', 'гь',
    'да', 'ду', 'до', 'ды', 'ди', 'де', 'дя', 'дё', 'дю', 'дэ', 'дь',
    'жа', 'жу', 'жо', 'жы', 'жи', 'же', 'жё', 'жь',
    'за', 'зу', 'зо', 'зы', 'зя', 'зе', 'зя', 'зё', 'зю', 'зэ', 'зь',
    'ла', 'лу', 'ло', 'лы', 'ли', 'ле', 'ля', 'лё', 'лю', 'лэ', 'ль',
    'па', 'пу', 'по', 'пы', 'пи', 'пе', 'пя', 'пё', 'пю', 'пэ', 'пь', 
    'ры', 'ру', 'ро', 'ры', 'ри', 'ре', 'ря', 'рё', 'рю', 'рэ', 'рь',
    'са', 'су', 'со', 'сы', 'си', 'се', 'ся', 'сё', 'сю', 'сэ', 'сь',
    'фа', 'фу', 'фо', 'фы', 'фи', 'фе', 'фя', 'фё', 'фю', 'фэ', 'фь',
    'ца', 'цу', 'цо', 'цы', 'ци', 'це', 
    'ча', 'чу', 'чю', 'чо', 'чи', 'че', 'чё', 'чь',
    'ша', 'шу', 'шо', 'ши', 'ше', 'шё', 'шь',
    'ща', 'щу', 'що', 'щи', 'ще', 'щё', 'щь',
    'йа', 'йо', 'йи', 'йе', 'йю',
    'мой', 'ив', 'нож', 'режь', 'ток', 'луг', 'вал', 'ум', 'сон', 'скрип', 
    'лоб', 'укор', 'пёс', 'вяз', 'кот', 'ряд', 'штраф', 'сух', 'птиц', 'мышь',
    'шабаш', 'ель', 'наземь', 'день', 'крепь', 'рябь', 'зверь', 'высь', 'вязь', 
    'сеть', 'медь', 'явь', 'верфь', 'юдифь', 'дочь', 'плач', 'вещь', 'лещ'
  ];

  let punctuation =[
    '!', '.', ',', ';', ':', '?', '...', '-'
  ];

  let symbol, fl = false, fl2 = false;
  let str = '';

  while( str.length < length ){
    symbol = str.charAt(str.length-1); 

    if( getRandomInt( 0, 100 ) < spaceProbability 
      && symbol !== ' '
      && str.length > 0 
      && symbol.charCodeAt() >= 64){
        if( getRandomInt( 0, 100 ) < punctuationProbability){ 
          if( fl ){
            str += ')';
            fl = false;
          }
          if( getRandomInt( 0, 100 ) < punctuationProbability ) 
            str += punctuation[ getRandomInt(0, punctuation.length) ];
        }
        
        str += ' ';
        fl2 = true;

        if( getRandomInt( 0, 100 ) < punctuationProbability && !fl ){
          str += '('
          fl = true;
        }
    }
    else{
      let slyllable = slyllables[ getRandomInt(0, slyllables.length) ];  
      if( getRandomInt( 0, 100 ) < upperCaseProbablity && fl2 || str.length == 0 ){
        let tmp = slyllable;
        slyllable = tmp[0].toUpperCase() + tmp.substr(1, tmp.length)
      }
      str += slyllable
      fl2 = false
    }
  }

  if( str.charAt( str.length-1 ) == ' ' ) str = str.substring(0, str.length-1)
  if( fl ) str += ')'

  return str
}
