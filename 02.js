function firstFunction() {
    console.log('firstFunction 입니다.');
    secondFunction();
  }
  
  function secondFunction() {
    // 2 초간 기다린다.
    setTimeout(function () {
      console.log('secondFunction 입니다.');
    }, 2000);
  }
  
  firstFunction();
  console.log('전역 코드 실행 중!');
  
  // print: firstFunction 입니다.
  // print: 전역 코드 실행 중!
  /** 2 초간 기다린다. **/
  // print: secondFunction 입니다.