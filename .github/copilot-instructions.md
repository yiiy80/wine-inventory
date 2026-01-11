# React + TypeScript + Tailwind + FastAPI プロジェクトのための GitHub Copilot 指示

このドキュメントは、React と TypeScript および Tailwind CSS を使用したフロントエンド、FastAPI を使用した RESTful バックエンドのフルスタックプロジェクトで、高品質で一貫したコードを生成するための GitHub Copilot の包括的なガイドラインを提供します。

## プロジェクト概要と技術スタック

### フロントエンド

- **フレームワーク**: React 18+ と TypeScript
- **スタイリング**: Tailwind CSS を使用したユーティリティファーストスタイリング
- **状態管理**: React hooks (useState, useEffect) と Context API
- **ルーティング**: React Router を使用したクライアントサイドルーティング
- **フォーム**: React Hook Form を使用したフォーム管理
- **HTTP クライアント**: Axios または Fetch API を使用した API 呼び出し
- **ビルドツール**: Vite を使用した開発とビルド

### バックエンド

- **フレームワーク**: 高性能な RESTful API のための FastAPI
- **言語**: Python 3.8+
- **ORM**: SQLAlchemy を使用したデータベース操作
- **データ検証**: Pydantic を使用したリクエスト/レスポンスモデル
- **認証**: JWT トークンまたは OAuth2
- **ドキュメント**: 自動生成された OpenAPI/Swagger ドキュメント

### データベース

- **プライマリ DB**: PostgreSQL または MySQL
- **ORM**: SQLAlchemy と Alembic を使用した移行
- **接続**: パフォーマンスのための Async SQLAlchemy

### 開発ツール

- **バージョン管理**: Git と GitHub
- **コンテナ化**: Docker と Docker Compose
- **テスト**: Jest (フロントエンド), Pytest (バックエンド)
- **リンティング**: ESLint (フロントエンド), Black/Flake8 (バックエンド)
- **CI/CD**: GitHub Actions

## コードスタイルガイドライン

### フロントエンド (TypeScript/React)

- **ファイル命名**: PascalCase for コンポーネント (例: `UserProfile.tsx`), camelCase for ユーティリティ (例: `utils.ts`)
- **コンポーネント構造**: 関数コンポーネントと hooks
- **インポート**: グループインポート (React, サードパーティ, ローカル), `@/` エイリアスを使用した絶対インポート
- **タイプ**: ファイルの先頭にインターフェース/タイプを定義, union の場合は `type`, object の場合は `interface` を使用
- **スタイリング**: JSX で Tailwind クラスを直接使用, カスタムスタイルは `styles/` ディレクトリ
- **ディレクトリ構造**:
  ```
  src/
  ├── components/     # 再利用可能な UI コンポーネント
  ├── hooks/         # カスタム React hooks
  ├── pages/         # ページコンポーネント
  ├── services/      # API サービス関数
  ├── types/         # TypeScript タイプ定義
  ├── utils/         # ユーティリティ関数
  └── styles/        # グローバルスタイルと Tailwind 設定
  ```

### バックエンド (Python/FastAPI)

- **ファイル命名**: すべてのファイルと関数で snake_case (例: `user_service.py`)
- **コードスタイル**: PEP 8 に従い, Black を使用したフォーマット
- **タイプヒント**: すべての関数パラメータと戻り値の型にタイプヒントを使用
- **インポート**: グループインポート (標準ライブラリ, サードパーティ, ローカル)
- **ディレクトリ構造**:
  ```
  app/
  ├── api/           # API ルートハンドラー
  ├── core/          # コア機能 (設定, セキュリティ)
  ├── db/            # データベースモデルとセッション
  ├── schemas/       # Pydantic モデル
  ├── services/      # ビジネスロジック
  └── utils/         # ユーティリティ関数
  ```

## 開発パターン

### フロントエンド開発

#### コンポーネント設計原則

- **継承よりコンポジション**: 小さなコンポーネントを組み合わせて複雑な UI を構築
- **単一責任**: 各コンポーネントは明確な目的を持つべき
- **Props インターフェース**: TypeScript で明確な prop インターフェースを定義
- **デフォルト Props**: オプションの props にデフォルトパラメータを使用

#### 制御されたコンポーネント

```typescript
// 良い例: 適切な型付けの制御されたコンポーネント
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomInput: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border rounded px-3 py-2"
    />
  );
};
```

#### カスタム Hooks

- 再利用可能なロジックをカスタム hooks に抽出
- 命名規則: `use[HookName]`
- オブジェクトまたは配列を返し、個別の値を返さない

```typescript
// 良い例: API データ取得のためのカスタム hook
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("ユーザーの取得に失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading };
};
```

#### フォーム処理

- 複雑なフォームに React Hook Form を使用
- Zod または Yup を使用した検証の実装
- フォーム状態を中央で処理

### バックエンド開発

#### RESTful API 設計

- **リソースベースの URL**: `/users`, `/users/{id}`, `/users/{id}/posts`
- **HTTP メソッド**: GET (取得), POST (作成), PUT/PATCH (更新), DELETE (削除)
- **ステータスコード**: 200 (成功), 201 (作成), 400 (不正リクエスト), 401 (未認証), 404 (見つからない), 500 (サーバーエラー)
- **レスポンス形式**: `data`, `message`, `errors` フィールドを持つ一貫した JSON 構造

#### FastAPI パターン

```python
# 良い例: FastAPI ルート with 適切な型付けと検証
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, crud
from app.core.database import get_db

router = APIRouter()

@router.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    return db_user

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)
```

#### Pydantic モデル

- 入力/出力に別々のスキーマを使用してデータ公開を制御
- Pydantic のフィールドバリデーターを使用して検証を実装
- ネストされたモデルを定義して複雑なデータ構造を扱う

```python
# 良い例: 検証付きの Pydantic モデル
from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('パスワードは8文字以上でなければなりません')
        return v

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
```

#### 依存性注入

- FastAPI の依存性注入システムをデータベースセッション、認証などに使用
- 再利用可能な依存性を作成して一般的な機能を扱う

```python
# 良い例: データベースと認証のための依存性注入
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core import auth
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="資格情報を検証できません",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return auth.verify_token(token, credentials_exception, db)
```

## データベース設計

### SQLAlchemy モデル

- 宣言ベースを使用してモデル定義
- `relationship()` を使用して関係を定義
- 適切なカスケードとバックリファレンスを実装

```python
# 良い例: 関係付きの SQLAlchemy モデル
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="owner")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="posts")
```

### データベース関係

- **一対多**: User は多くの Post を持つ
- **多対多**: Post は多くの Tag を持ち、Tag は多くの Post に属する (関連テーブルを使用)
- **自己参照**: コメントが他のコメントに返信

## テスト戦略

### フロントエンドテスト

- **コンポーネントテスト**: React Testing Library を使用したコンポーネント動作
- **Hook テスト**: `@testing-library/react-hooks` でカスタム hooks をテスト
- **モッキング**: API 呼び出しと外部依存性をモック

```typescript
// 良い例: コンポーネントテスト例
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomInput } from "./CustomInput";

test("値が変更されたときに onChange を呼び出す", () => {
  const handleChange = jest.fn();
  render(<CustomInput value="" onChange={handleChange} />);

  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "test" } });

  expect(handleChange).toHaveBeenCalledWith("test");
});
```

### バックエンドテスト

- **API テスト**: TestClient を使用したエンドポイントテスト
- **ユニットテスト**: 個別の関数とクラスをテスト
- **データベーステスト**: 高速テストのためのインメモリ SQLite を使用

```python
# 良い例: FastAPI テスト例
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_user():
    response = client.get("/users/1")
    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"

def test_create_user():
    response = client.post(
        "/users/",
        json={"email": "newuser@example.com", "password": "testpass"}
    )
    assert response.status_code == 201
    assert response.json()["email"] == "newuser@example.com"
```

## セキュリティ考慮事項

### フロントエンドセキュリティ

- **入力サニタイズ**: XSS を防ぐためにユーザー入力をサニタイズ
- **HTTPS のみ**: 本番環境では常に HTTPS を使用
- **トークンストレージ**: JWT トークンを安全に保存 (httpOnly cookies を推奨)
- **CORS**: API 呼び出しのために CORS を適切に設定

### バックエンドセキュリティ

- **入力検証**: Pydantic ですべての入力を検証
- **認証**: 適切な JWT/OAuth2 認証を実装
- **認可**: ロールベースアクセスコントロール (RBAC) を使用
- **レートリミティング**: 悪用を防ぐためのレートリミティングを実装
- **SQL インジェクション防止**: パラメータ化クエリを使用
- **パスワードハッシュ**: パスワードハッシュに bcrypt または argon2 を使用

```python
# 良い例: パスワードハッシュと検証
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

## デプロイメントと運用

### Docker 設定

- **マルチステージビルド**: 最適化のためのマルチステージ Dockerfile を使用
- **環境変数**: .env ファイルで設定
- **ヘルスチェック**: ヘルスチェックエンドポイントを実装

```dockerfile
# 良い例: Python アプリのためのマルチステージ Dockerfile
FROM python:3.9-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.9-slim

COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### CI/CD パイプライン

- **自動テスト**: すべての push/PR でテストを実行
- **コード品質**: 自動的にリントとフォーマット
- **セキュリティスキャン**: 脆弱性をスキャン
- **デプロイメント**: ステージング/本番への自動デプロイ

```yaml
# 良い例: GitHub Actions CI/CD 例
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Python のセットアップ
        uses: actions/setup-python@v2
        with:
          python-version: "3.9"
      - name: 依存関係のインストール
        run: pip install -r requirements.txt
      - name: テストの実行
        run: pytest
```

## コードレビューチェックリスト

### フロントエンドレビューポイント

- [ ] コンポーネントが単一責任原則に従っている
- [ ] 適切な TypeScript 型付け
- [ ] Tailwind クラスが一貫して使用されている
- [ ] 本番コードに console.log 文がない
- [ ] API 呼び出しの適切なエラーハンドリング
- [ ] アクセシビリティ考慮 (ARIA ラベル, キーボードナビゲーション)
- [ ] パフォーマンス最適化 (メモ化, 遅延ロード)

### バックエンドレビューポイント

- [ ] Pydantic による適切な入力検証
- [ ] 適切な HTTP ステータスコードが返される
- [ ] データベースクエリが最適化 (N+1 問題回避)
- [ ] 適切な例外タイプによるエラーハンドリング
- [ ] セキュリティ考慮事項が実装されている
- [ ] PEP 8 とタイプヒントが使用されている
- [ ] API ドキュメントが更新されている

## ベストプラクティス

### エラーハンドリング

- **フロントエンド**: try-catch ブロックを使用, ユーザーフレンドリーなエラーメッセージを表示
- **バックエンド**: カスタム例外ハンドラー, 一貫したエラーレスポンスを返却

```python
# 良い例: FastAPI グローバル例外ハンドラー
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail, "type": "error"}
    )
```

### ページネーション

- **フロントエンド**: 無限スクロールまたはページベースのページネーションを実装
- **バックエンド**: SQLAlchemy のページネーションユーティリティを使用

```python
# 良い例: バックエンドページネーション
from sqlalchemy.orm import Session
from fastapi import Query

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

@router.get("/users/")
def read_users(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users
```

### キャッシング

- **フロントエンド**: React Query/SWR で API レスポンスをキャッシュ
- **バックエンド**: Redis でセッションストレージと API レスポンスキャッシング

### ログ記録

- 適切なログレベルで構造化ログを使用
- 重要なイベントとエラーをデバッグのためにログ

```python
# 良い例: FastAPI での構造化ログ
import logging

logger = logging.getLogger(__name__)

@router.post("/users/")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = crud.create_user(db=db, user=user)
        logger.info(f"ユーザー作成: {db_user.id}")
        return db_user
    except Exception as e:
        logger.error(f"ユーザー作成失敗: {e}")
        raise HTTPException(status_code=500, detail="内部サーバーエラー")
```

これらのガイドラインに従って、React + FastAPI スタック全体で一貫性があり、メンテナンス可能で、高品質なコードを確保してください。
