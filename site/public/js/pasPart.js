function getRandomInt(min, max){
  return Math.floor( Math.random() * ( max - min ) ) + min;
}

function randomSlyllables( length, spaceProbability, punctuationProbability ){
  let slyllables = [ 
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
    'йа', 'йо', 'йи', 'йе', 'йю'
  ];

  let punctuation =[
    '!', '.', ',', ';', ':', '?', '...', '-'
  ];

  let symbol, fl = false;
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

        if( getRandomInt( 0, 100 ) < punctuationProbability && !fl ){
          str += '('
          fl = true;
        }
    }
    else str += slyllables[ getRandomInt(0, slyllables.length) ];
  }

  if( fl ) str += ')'

  return str
}

// function windowLoad(){
//   "use strict";
  
//   console.log( randomSlyllables( 300, 40, 30 ) );

// }