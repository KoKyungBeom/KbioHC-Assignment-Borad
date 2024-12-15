# 과제 - 로그인부터 CRUD가 가능한 간단한 게시판 

사용자와 관리자가 사용할 수 있는 간단한 게시판 시스템입니다. 

로그인/로그아웃, 게시글 및 댓글 관리, 게시판 정렬 및 검색 기능을 제공합니다.

---

## 주요 기능

### 회원 기능
- **인증**:
  - 로그인/로그아웃
  - 이메일 인증
  - 회원가입 및 탈퇴
- **게시글 관리**:
  - 게시글 작성, 수정, 삭제
  - 이미지 업로드
  - 자신이 작성한 게시글 조회
- **댓글 관리**:
  - 댓글 작성, 수정, 삭제
  - 자신이 작성한 댓글 조회
- **게시글 필터링 및 검색**:
  - 최신순 및 조회순으로 정렬(최신공지 2개는 항상 상단)
  - 제목, 내용, 작성자를 기준으로 게시글 검색
  - 공지사항만 필터링하여 조회

### 관리자 기능
- **회원 및 게시글 관리**:
  - 회원 목록 확인
  - 게시글 목록 확인
  - 모든 게시글 삭제 가능
  - 공지사항 게시글 작성 및 확인

---

## 설치 및 실행 방법

### 사전 요구사항
프로젝트를 실행하기 전에 아래 소프트웨어가 설치되어 있어야 합니다:
- [Node.js](https://nodejs.org/) 및 npm
- [Git](https://git-scm.com/)

### 프로젝트 클론
아래 명령어를 실행하여 프로젝트를 클론합니다:
bash -> git clone <레포지토리-URL> -> cd <프로젝트-폴더>

로컬에서 실행하는법
clinet는 npm install 후에 npm start로 시작
server는 resources 폴더에 application.yml을 만들고 시작

간편하게 실행하는법
http://simple-board.s3-website.ap-northeast-2.amazonaws.com 클라이언트 배포주소
http://ec2-43-200-241-1.ap-northeast-2.compute.amazonaws.com:8080 API요청 주소

---

# API명세서


### 1. 신규 사용자 생성

### 엔드포인트:
**POST** `/users`

### 설명:
새로운 사용자를 등록하고 이메일 인증 코드를 전송합니다.

### 요청 바디:
```json
{
  "email": "string (유효한 이메일 형식)",
  "nickname": "string (2-10자의 영문, 숫자, 한글)",
  "password": "string (10-20자, 대문자, 숫자, 특수문자를 최소 1개 포함)"
}
```

### 응답:
- **상태 코드:** 202 Accepted
- **내용:** "이메일을 확인하여 인증코드를 입력해주세요."

---

## 2. 이메일 코드 인증 및 사용자 등록 완료

### 엔드포인트:
**POST** `/users/verify`

### 설명:
이메일 인증 코드를 확인하고 사용자 등록을 완료합니다.

### 요청 바디:
```json
{
  "email": "string",
  "authCode": "string"
}
```

### 응답:
- **상태 코드:** 201 Created
- **헤더:** 새로 생성된 사용자의 URI를 포함한 Location 헤더.

---

## 3. 사용자 정보 조회 (마이페이지)

### 엔드포인트:
**GET** `/users/mypage`

### 설명:
인증된 사용자의 정보를 조회합니다.

### 응답:
- **상태 코드:** 200 OK
- **내용:**
  ```json
  {
    "data": {
      "userId": "long",
      "email": "string",
      "nickname": "string",
      "createdAt": "ISO 8601 timestamp",
      "modifiedAt": "ISO 8601 timestamp",
      "userStatus": "string (상태 enum)"
    }
  }
  ```

---

## 4. 전체 사용자 조회

### 엔드포인트:
**GET** `/users`

### 설명:
모든 사용자를 페이징 처리하여 조회합니다.

### 쿼리 파라미터:
- `page`: 양의 정수, 페이지 번호.
- `size`: 양의 정수, 페이지당 사용자 수.

### 응답:
- **상태 코드:** 200 OK
- **내용:**
  ```json
  {
    "content": [
      {
        "userId": "long",
        "email": "string",
        "nickname": "string",
        "createdAt": "ISO 8601 timestamp",
        "modifiedAt": "ISO 8601 timestamp",
        "userStatus": "string (상태 enum)"
      }
    ],
    "page": {
      "size": "integer",
      "totalElements": "integer",
      "totalPages": "integer",
      "number": "integer"
    }
  }
  ```

---

## 5. 이메일 중복 확인

### 엔드포인트:
**GET** `/users/check-email`

### 설명:
이메일이 이미 등록되었는지 확인합니다.

### 쿼리 파라미터:
- `email`: 문자열, 확인할 이메일.

### 응답:
- **상태 코드:** 200 OK
- **내용:** `true | false`

---

## 6. 닉네임 중복 확인

### 엔드포인트:
**GET** `/users/check-nickname`

### 설명:
닉네임이 이미 사용 중인지 확인합니다.

### 쿼리 파라미터:
- `nickName`: 문자열, 확인할 닉네임.

### 응답:
- **상태 코드:** 200 OK
- **내용:** `true | false`

---

## 7. 사용자 삭제

### 엔드포인트:
**DELETE** `/users/{user-id}`

### 설명:
ID로 사용자 계정을 삭제합니다.

### 경로 파라미터:
- `user-id`: 양의 정수, 삭제할 사용자 ID.

### 응답:
- **상태 코드:** 204 No Content

---

## 1. 게시글 생성

### 엔드포인트:
**POST** `/posts`

### 설명:
새로운 게시글을 작성합니다.

### 요청 바디:
```json
{
  "title": "string",
  "content": "string",
  "imageUrl": "string (선택사항)"
}
```

### 응답:
- **상태 코드:** 201 Created
- **헤더:** 생성된 게시글의 URI를 포함한 Location 헤더.

---

## 2. 이미지 업로드

### 엔드포인트:
**POST** `/posts/upload-image`

### 설명:
게시글에 첨부할 이미지를 업로드합니다.

### 요청:
- 파일: MultipartFile 형식의 이미지 파일.

### 응답:
- **상태 코드:** 200 OK
- **내용:** 업로드된 이미지의 URL.

### 에러:
- **404 FILE_NOT_FOUND:** 파일이 없거나 비어있을 경우.

---

## 3. 게시글 수정

### 엔드포인트:
**PATCH** `/posts/{post-id}`

### 설명:
특정 게시글을 수정합니다.

### 요청 바디:
```json
{
  "title": "string",
  "content": "string",
  "imageUrl": "string (선택사항)"
}
```

### 응답:
- **상태 코드:** 200 OK
- **내용:** 수정된 게시글 정보.

---

## 4. 단일 게시글 조회

### 엔드포인트:
**GET** `/posts/{post-id}`

### 설명:
특정 게시글의 상세 정보를 조회합니다.

### 응답:
- **상태 코드:** 200 OK
- **내용:**
  ```json
  {
    "postId": 123,
    "title": "Example Title",
    "content": "This is the content of the post.",
    "nickname": "AuthorNickname",
    "imageUrl": "http://example.com/image.png",
    "createdAt": "2024-12-15T12:34:56",
    "modifiedAt": "2024-12-15T13:45:67",
    "viewCount": 100,
    "commentCount": 5,
    "notice": false,
    "comments": [
      {
        "commentId": 1,
        "content": "This is a comment.",
        "nickname": "CommenterNickname",
        "createdAt": "2024-12-15T14:00:00",
        "modifiedAt": "2024-12-15T14:05:00"
      },
      {
        "commentId": 2,
        "content": "Another comment here.",
        "nickname": "AnotherCommenter",
        "createdAt": "2024-12-15T14:10:00",
        "modifiedAt": "2024-12-15T14:15:00"
      }
    ]
  }
  ```

---

## 5. 공지사항 조회

### 엔드포인트:
**GET** `/posts/notice`

### 설명:
공지사항 게시글 목록을 조회합니다.

### 쿼리 파라미터:
- `page`: 양의 정수, 페이지 번호.
- `size`: 양의 정수, 페이지당 게시글 수.
- `sortBy`: 정렬 기준 (기본값: createdAt).

### 응답:
- **상태 코드:** 200 OK
- **내용:**
  ```json
  {
    "data": [
      {
        "postId": 123,
        "title": "Notice Title",
        "content": "Important announcement",
        "nickname": "Admin",
        "createdAt": "2024-12-15T12:00:00",
        "modifiedAt": "2024-12-15T12:30:00"
      }
    ],
    "page": {
      "size": 10,
      "totalElements": 1,
      "totalPages": 1,
      "number": 0
    }
  }
  ```

---

## 6. 본인 게시글 조회

### 엔드포인트:
**GET** `/posts/my-posts`

### 설명:
사용자가 작성한 게시글 목록을 조회합니다.

### 쿼리 파라미터:
- `page`: 양의 정수, 페이지 번호.
- `size`: 양의 정수, 페이지당 게시글 수.
- `sortBy`: 정렬 기준 (기본값: createdAt).

### 응답:
- **상태 코드:** 200 OK
- **내용:**
  ```json
  {
    "data": [
      {
        "postId": 456,
        "title": "My Post Title",
        "content": "My content here.",
        "nickname": "User123",
        "createdAt": "2024-12-15T10:00:00",
        "modifiedAt": "2024-12-15T11:00:00"
      }
    ],
    "page": {
      "size": 10,
      "totalElements": 1,
      "totalPages": 1,
      "number": 0
    }
  }
  ```

---

## 7. 전체 게시글 조회

### 엔드포인트:
**GET** `/posts`

### 설명:
모든 게시글 목록을 조회합니다.

### 쿼리 파라미터:
- `page`: 양의 정수, 페이지 번호.
- `size`: 양의 정수, 페이지당 게시글 수.
- `searchBy`: 검색 기준 (옵션: title, content, nickname).
- `keyword`: 검색어.
- `sortBy`: 정렬 기준 (기본값: createdAt).

### 응답:
- **상태 코드:** 200 OK
- **내용:**
  ```json
  {
    "notices": [
      {
        "postId": 123,
        "title": "Notice Title",
        "content": "Important announcement",
        "nickname": "Admin",
        "createdAt": "2024-12-15T12:00:00",
        "modifiedAt": "2024-12-15T12:30:00"
      }
    ],
    "data": [
      {
        "postId": 456,
        "title": "General Post Title",
        "content": "General post content.",
        "nickname": "User123",
        "createdAt": "2024-12-15T10:00:00",
        "modifiedAt": "2024-12-15T11:00:00"
      }
    ],
    "page": {
      "size": 10,
      "totalElements": 2,
      "totalPages": 1,
      "number": 0
    }
  }
  ```

---

## 8. 게시글 삭제

### 엔드포인트:
**DELETE** `/posts/{post-id}`

### 설명:
특정 게시글을 삭제합니다.

### 경로 파라미터:
- `post-id`: 양의 정수, 삭제할 게시글 ID.

### 응답:
- **상태 코드:** 204 No Content


---


## 1. 댓글 작성

### 엔드포인트:
**POST** `/posts/{post-id}/comments`

### 설명:
특정 게시글에 댓글을 작성합니다.

### 요청 바디:
```json
{
  "postId": "long (게시글 ID)",
  "content": "string (댓글 내용)"
}
```

### 응답:
- **상태 코드:** 201 Created
- **헤더:** 생성된 댓글의 URI를 포함한 Location 헤더.

---

## 2. 댓글 수정

### 엔드포인트:
**PATCH** `/comments/{comment-id}`

### 설명:
특정 댓글을 수정합니다.

### 요청 바디:
```json
{
  "commentId": "long (댓글 ID)",
  "content": "string (수정된 댓글 내용)"
}
```

### 응답:
- **상태 코드:** 200 OK
- **내용:**
  ```json
  {
    "commentId": "long",
    "content": "string",
    "modifiedAt": "ISO 8601 timestamp"
  }
  ```

---

## 3. 특정 사용자의 댓글 조회

### 엔드포인트:
**GET** `/comments`

### 설명:
특정 사용자가 작성한 댓글 목록을 조회합니다.

### 쿼리 파라미터:
- `page`: 양의 정수, 페이지 번호.
- `size`: 양의 정수, 페이지당 댓글 수.
- `user-id`: 양의 정수, 사용자 ID.

### 응답:
- **상태 코드:** 200 OK
- **내용:**
  ```json
  {
    "data": [
      {
        "postId": "long",
        "content": "string",
        "title": "string",
        "modifiedAt": "ISO 8601 timestamp"
      }
    ],
    "page": {
      "size": "integer",
      "totalElements": "integer",
      "totalPages": "integer",
      "number": "integer"
    }
  }
  ```

---

## 4. 댓글 삭제

### 엔드포인트:
**DELETE** `/comments/{comment-id}`

### 설명:
특정 댓글을 삭제합니다.

### 경로 파라미터:
- `comment-id`: 양의 정수, 삭제할 댓글 ID.

### 응답:
- **상태 코드:** 204 No Content
