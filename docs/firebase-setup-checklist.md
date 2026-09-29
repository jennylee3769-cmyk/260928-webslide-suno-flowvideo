# Firebase 청중 동기화 설정 체크리스트

## 1. Realtime Database

- Firebase 콘솔에서 프로젝트 생성
- 빌드 > Realtime Database > 데이터베이스 만들기
- 수업 장소와 가까운 리전 선택
- 잠금 모드로 시작
- 데이터베이스 상단의 `databaseURL` 복사

## 2. Authentication

- 빌드 > Authentication > 시작하기
- 로그인 방법 > 이메일/비밀번호 사용 설정
- 사용자 탭에서 강사 계정 추가
- 생성된 강사 계정의 UID 복사

## 3. 보안 규칙

- Realtime Database > 규칙 열기
- 저장소의 `firebase/database.rules.json` 전체 붙여넣기
- 규칙 게시
- 로그인 계정만으로 쓰기 권한이 생기지 않는지 확인

## 4. 강사 권한

- Realtime Database > 데이터 탭 열기
- 루트에 `admins` 노드 추가
- 하위 키에 강사 UID 입력
- 강사 UID의 값을 불리언 `true`로 저장
- 문자열 `"true"`가 아닌 불리언 값인지 확인

```text
admins
  강사_UID: true
```

## 5. 웹 앱 등록

- 프로젝트 설정 > 일반 > 내 앱 > 웹 앱 추가
- 앱 이름 입력 후 등록
- SDK 설정 및 구성에서 `firebaseConfig` 값 복사
- `firebase/firebase-config.js`의 예시 값을 실제 값으로 교체
- `databaseURL` 항목 포함 확인
- `window.DECK_ID`를 다른 강의와 겹치지 않는 값으로 유지

## 6. 동작 확인

- 기본 주소 `slides.html`: 청중 화면
- 강사 주소 `slides.html?admin`: 이메일 로그인
- 강사 화면에서 다음 장 이동 후 청중 화면 자동 이동 확인
- 잠금 해제 후 청중의 자유 이동 확인
- PDF 막기 후 청중의 PDF 버튼과 P 키 차단 확인
- 로그아웃 후 관리자 버튼 숨김 확인
- 설정값 입력 전에는 자유 열람 모드 유지 확인

