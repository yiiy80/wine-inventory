# Claude AI 指示書 — wine-inventory（赤ワイン在庫管理システム）

このファイルは、yiiy80/wine-inventory（React + TypeScript フロントエンド、FastAPI + Python バックエンド）のコードベースに対して Claude が生成・提案するコードの品質、スタイル、アーキテクチャの一貫性を確保するためのガイドラインです。Claude はここで定義された規約とパターンに従い、最小限の手直しで統合できる高品質な提案を行ってください。

---

## プロジェクト概要

**赤ワイン在庫管理システム** — 赤ワイン製造業者と葡萄園オーナーのための専門的なWeb応用

### 主な機能
- 赤ワイン在庫追跡と管理
- 出入庫管理（入庫/出庫）
- 在庫予警システム
- データ可視化ダッシュボード
- マルチユーザー権限管理
- 操作ログ記録
- データ導入/導出機能

### 技術スタック
- **フロントエンド**:  React 18+、TypeScript、Vite、Tailwind CSS、React Router、Axios、Recharts
- **バックエンド**: FastAPI、Python 3.8+、SQLAlchemy ORM、Pydantic、Alembic
- **データベース**: SQLite（開発）、PostgreSQL（本番推奨）
- **認証**: JWT + OAuth2
- **テスト**: Jest (FE)、Pytest (BE)
- **Lint/Format**: ESLint + Prettier (FE)、Black + Flake8 (BE)

### 言語構成
- TypeScript:  65. 8%
- Python: 29.7%
- Mermaid: 1.7%
- Shell: 1.0%
- CSS: 0.9%
- JavaScript: 0.8%
- HTML: 0.1%

---

## 一般原則

### Claude への指示
1. **既存のコードスタイルと構造に厳密に従う** — 規約と整合しない変更を提案しない
2. **小さな単位での実装を推奨** — 小関数、小コンポーネント、小エンドポイント単位
3. **型安全性を確保** — TypeScript は厳密な型、Python は型ヒント（type hints）を必ず付与
4. **セキュリティを重視** — ハードコードされたシークレットを含めない。環境変数を使用
5. **テストを同梱** — ビジネスロジック・API変更には対応するユニットテストを含める
6. **ドキュメント付与** — 関数・クラスには JSDoc または docstring を付与
7. **既存パターンを踏襲** — プロジェクト内で確立されたパターン（ディレクトリ構造、命名規則）に従う

### 提案時の記載内容
変更提案には以下を含める：
- **変更内容**: 何をしたか（1-2行）
- **影響範囲**: 関連ファイル・モジュール
- **理由**: なぜそう実装したか
- **セキュリティ考慮**: SQL インジェクション、認証、機密情報に関する注意点
- **テスト**:  追加したテストの概要
- **マイグレーション**: DB スキーマ変更がある場合

---

## フロントエンド（TypeScript / React）ルール

### ディレクトリ構造（遵守必須）
```
frontend/src/
├── components/          # 再利用可能なコンポーネント
├── pages/              # ページコンポーネント（ルートごと）
├── hooks/              # カスタム React Hook
├── contexts/           # React Context（認証、テーマなど）
├── services/           # API クライアント、ビジネスロジック
├── types/              # TypeScript 型定義
├── utils/              # ユーティリティ関数
├── styles/             # グローバルスタイル（Tailwind 優先）
├── App.tsx             # メインアプリケーションコンポーネント
└── main.tsx            # エントリーポイント
```

### 命名規則
- **React コンポーネント**: PascalCase（例：`WineCard. tsx`、`LoginForm.tsx`）
- **その他関数・ファイル**: camelCase（例：`formatDate. ts`、`useAuth.ts`）
- **型・インターフェース**: PascalCase（例：`Wine`、`UserLogin`）
- **定数**: UPPER_SNAKE_CASE（例：`API_BASE_URL`、`DEFAULT_PAGE_SIZE`）

### コンポーネント設計
- **関数コンポーネント + Hooks のみ使用** — クラスコンポーネントは禁止
- **Props は interface で明確に定義**
```tsx
interface WineCardProps {
  wine: Wine;
  onEdit?:  (id: number) => void;
  onDelete?: (id: number) => void;
}

const WineCard: React.FC<WineCardProps> = ({ wine, onEdit, onDelete }) => {
  // ... 
};
```

- **単一責任原則を遵守** — ロジックが複雑な場合は hooks または services に分離
- **Presentation / Container の分離** — UI ロジックと状態管理を分離

### API 呼び出し
- **services/ に API クライアント関数を配置** — Axios を使用
- **hooks から API 関数を呼び出す**
- **型定義は types/index.ts で管理** — Pydantic レスポンスに合わせる
- **エラーハンドリングは呼び出し側で行う** — try-catch でハンドル

例：
```typescript
// services/api.ts
export const wineAPI = {
  getWines: async (params?:  GetWinesParams): Promise<WineListResponse> => {
    const response = await api.get<WineListResponse>('/wines', { params });
    return response.data;
  },
  
  createWine: async (data: WineCreate): Promise<Wine> => {
    const response = await api.post<Wine>('/wines', data);
    return response.data;
  },
};

// hooks/useWines.ts
export const useWines = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadWines = async () => {
    try {
      setLoading(true);
      const data = await wineAPI.getWines();
      setWines(data. items);
    } catch (error) {
      toast.error('ワインリスト読み込み失敗');
    } finally {
      setLoading(false);
    }
  };
  
  return { wines, loading, loadWines };
};
```

### フォーム処理
- **React Hook Form を使用** — フォーム状態管理
- **Zod または類似バリデーション** — 型安全なバリデーション
```tsx
import { useForm } from 'react-hook-form';

interface WineFormData {
  name: string;
  vintage_year: number;
  region: string;
  price?:  number;
}

const WineForm: React. FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<WineFormData>();
  
  const onSubmit:  SubmitHandler<WineFormData> = async (data) => {
    try {
      await wineAPI.createWine(data);
      toast.success('ワイン追加成功');
    } catch (error) {
      toast.error('ワイン追加失敗');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {... register('name', { required: 'ワイン名は必須です' })} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">保存</button>
    </form>
  );
};
```

### スタイリング
- **Tailwind CSS を優先** — すべてのスタイルは Tailwind で実装
- **カスタム CSS は styles/ に配置** — 複雑な場合のみ
- **ダークモード対応** — `dark:` プレフィックスを使用

### テスト（Jest + React Testing Library）
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import WineCard from './WineCard';

describe('WineCard', () => {
  it('should render wine details', () => {
    const wine:  Wine = {
      id: 1,
      name: 'Bordeaux 2020',
      vintage_year: 2020,
      region: 'Bordeaux',
      current_stock: 10,
      low_stock_threshold: 5,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    
    render(<WineCard wine={wine} />);
    
    expect(screen.getByText('Bordeaux 2020')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });
  
  it('should call onEdit when edit button clicked', () => {
    const mockOnEdit = jest.fn();
    const wine: Wine = { /* ... */ };
    
    render(<WineCard wine={wine} onEdit={mockOnEdit} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith(wine.id);
  });
});
```

### インポート順序
```typescript
// 1. React とサードパーティ
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 外部ライブラリ
import axios from 'axios';
import toast from 'react-hot-toast';

// 3. 絶対エイリアス
import { wineAPI } from '@/services/api';
import { Wine } from '@/types';

// 4. 相対インポート
import WineCard from './WineCard';
import './WinesPage.css';
```

---

## バックエンド（FastAPI / Python）ルール

### ディレクトリ構造（遵守必須）
```
backend/
├── main.py                  # FastAPI アプリケーション定義
├── database.py              # DB 接続、セッション管理
├── models. py                # SQLAlchemy ORM モデル
├── schemas.py               # Pydantic データスキーマ
├── auth.py                  # 認証・パスワード管理
├── routers/                 # API ルーター
│   ├── auth.py             # 認証エンドポイント
│   ├── wines.py            # ワイン管理エンドポイント
│   ├── inventory.py        # 出入庫管理エンドポイント
│   ├── dashboard.py        # ダッシュボードデータエンドポイント
│   ├── users.py            # ユーザー管理エンドポイント
│   ├── logs.py             # 操作ログエンドポイント
│   └── export_import.py    # データ導入/導出エンドポイント
├── services/                # ビジネスロジック層
│   ├── wine_service.py
│   ├── inventory_service.py
│   └── user_service.py
├── utils/                   # ユーティリティ関数
├── seed. py                  # 初期データシード
├── requirements.txt         # Python 依存
└── alembic/                 # DB マイグレーション（オプション）
```

### 命名規則
- **snake_case を厳密に使用** — ファイル名、関数名、変数名
- **Pydantic モデル**:  TitleCase（例：`WineCreate`、`UserResponse`）
- **SQLAlchemy モデル**: TitleCase（例：`Wine`、`InventoryTransaction`）
- **ルーター関数**: snake_case（例：`create_wine`、`get_transactions`）

### API 設計パターン

#### ルーターは軽く保つ
```python
# routers/wines.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import WineCreate, WineResponse
from services.wine_service import WineService

router = APIRouter()

@router.post('/wines', response_model=WineResponse, status_code=status.HTTP_201_CREATED)
def create_wine(
    wine_data: WineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """新しいワインを作成する"""
    service = WineService(db)
    return service.create_wine(wine_data, current_user. id)

@router.get('/wines/{wine_id}', response_model=WineResponse)
def get_wine(wine_id: int, db: Session = Depends(get_db)):
    """指定されたワインを取得する"""
    service = WineService(db)
    wine = service.get_wine(wine_id)
    if not wine:
        raise HTTPException(status_code=404, detail='ワインが見つかりません')
    return wine
```

#### Service 層でビジネスロジックを集約
```python
# services/wine_service.py
from sqlalchemy.orm import Session
from models import Wine
from schemas import WineCreate, WineUpdate

class WineService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_wine(self, wine_data: WineCreate, created_by: int) -> Wine:
        """新しいワインを作成"""
        wine = Wine(**wine_data.dict(), created_by=created_by)
        self.db.add(wine)
        self.db.commit()
        self.db.refresh(wine)
        return wine
    
    def get_wine(self, wine_id: int) -> Wine | None:
        """ワインを ID で取得"""
        return self.db.query(Wine).filter(Wine.id == wine_id).first()
    
    def update_wine(self, wine_id: int, wine_data: WineUpdate) -> Wine:
        """ワイン情報を更新"""
        wine = self.get_wine(wine_id)
        if not wine:
            raise ValueError('ワインが見つかりません')
        
        for key, value in wine_data.dict(exclude_unset=True).items():
            setattr(wine, key, value)
        
        self.db.commit()
        self.db.refresh(wine)
        return wine
```

### Pydantic スキーマ
```python
# schemas.py
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

# 入力スキーマ（Create/Update）
class WineCreate(BaseModel):
    name: str
    vintage_year: int = Field(..., ge=1800, le=2100)
    region: str
    grape_variety: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = None
    storage_location: Optional[str] = None
    current_stock: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)
    notes: Optional[str] = None
    image_url: Optional[str] = None
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v:  str) -> str:
        if not v or not v.strip():
            raise ValueError('ワイン名は空にできません')
        return v.strip()

class WineUpdate(BaseModel):
    name: Optional[str] = None
    vintage_year: Optional[int] = Field(None, ge=1800, le=2100)
    region: Optional[str] = None
    # ... その他フィールド

# 出力スキーマ（Response）
class WineResponse(BaseModel):
    id: int
    name: str
    vintage_year: int
    region: str
    grape_variety: Optional[str] = None
    price: Optional[float] = None
    supplier: Optional[str] = None
    storage_location: Optional[str] = None
    current_stock: int
    low_stock_threshold:  int
    notes: Optional[str] = None
    image_url: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # SQLAlchemy ORM モデルから変換
```

### 認証（JWT + OAuth2）
```python
# auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from models import User
from database import SessionLocal

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
security = HTTPBearer()

def get_password_hash(password: str) -> str:
    """パスワードをハッシュ化"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password:  str) -> bool:
    """パスワードを検証"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """アクセストークンを作成"""
    to_encode = data. copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> User:
    """現在のユーザーを取得（認証必須）"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get('sub')
        if user_id is None:
            raise HTTPException(
                status_code=status. HTTP_401_UNAUTHORIZED,
                detail='認証情報が無効です'
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='トークンが無効です'
        )
    
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='ユーザーが見つかりません'
        )
    
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """現在のユーザーが管理者であることを確認"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status. HTTP_403_FORBIDDEN,
            detail='管理者権限が必要です'
        )
    return current_user
```

### エラーハンドリング
```python
# HTTPException を使用して統一的なエラーレスポンスを返す
from fastapi import HTTPException, status

def get_wine_or_404(wine_id: int, db: Session) -> Wine:
    """ワインを取得、存在しない場合は 404 を返す"""
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'ID {wine_id} のワインが見つかりません'
        )
    return wine
```

### テスト（Pytest）
```python
# tests/test_wine_api.py
import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, Base, engine

client = TestClient(app)

@pytest.fixture(scope='function')
def db():
    """テスト用 DB セッション"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_create_wine_success(db):
    """ワイン作成成功テスト"""
    response = client.post(
        '/api/wines',
        json={
            'name': 'Bordeaux 2020',
            'vintage_year': 2020,
            'region': 'Bordeaux',
            'current_stock': 10,
            'low_stock_threshold': 5
        },
        headers={'Authorization': 'Bearer <token>'}
    )
    assert response.status_code == 201
    data = response.json()
    assert data['name'] == 'Bordeaux 2020'
    assert data['current_stock'] == 10

def test_create_wine_validation_error():
    """ワイン作成バリデーションエラーテスト"""
    response = client.post(
        '/api/wines',
        json={
            'name': '',  # 空文字列（エラー）
            'vintage_year': 2020,
            'region': 'Bordeaux'
        },
        headers={'Authorization': 'Bearer <token>'}
    )
    assert response. status_code == 422  # Validation Error
```

---

## セキュリティガイドライン

### 1. 認証・認可
- JWT トークンで認証を管理
- トークン有効期限を設定（デフォルト 30分）
- 管理者専用エンドポイントには `get_current_admin_user` を使用
- パスワードは bcrypt でハッシュ化

### 2. 機密情報管理
- **シークレットはコードに埋め込まない** — 環境変数 `.env` または GitHub Secrets で管理
```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./test.db')
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError('SECRET_KEY 環境変数が設定されていません')
```

### 3. SQL インジェクション対策
- **ORM（SQLAlchemy）を使用する** — 生 SQL は避ける
- パラメータバインディングを必ず使用
```python
# OK: ORM を使用
wine = db.query(Wine).filter(Wine.id == wine_id).first()

# NG: 生 SQL（危険）
# query = f"SELECT * FROM wines WHERE id = {wine_id}"
```

### 4. CORS 設定
```python
# main.py
from fastapi. middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',      # 開発環境
        'http://127.0.0.1:5173',
        # 本番環境では限定する
        # 'https://yourdomain.com'
    ],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allow_headers=['*'],
    max_age=600,
)
```

### 5. 入力バリデーション
- **Pydantic でスキーマバリデーション** — 不正なデータを拒否
- **フロントエンドでもバリデーション** — UX 向上のため

---

## テストと CI/CD

### テストカバレッジ
- **ユニットテスト**:  ビジネスロジック、サービス層
- **統合テスト**: API エンドポイント
- **E2E テスト**: 重要なワークフロー（ログイン、ワイン作成など）

### GitHub Actions（例）
```yaml
# .github/workflows/ci.yml
name: CI

on:  [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with: 
          python-version: '3.9'
      
      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run backend tests
        run: |
          cd backend
          pytest
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version:  '18'
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install
      
      - name: Run frontend tests
        run:  |
          cd frontend
          npm test
      
      - name: Build frontend
        run: |
          cd frontend
          npm run build
```

---

## コミット・PR メッセージ規約

### コミットメッセージ形式
```
<area>:  <short description>

[optional body]
```

例：
```
api: ワイン作成エンドポイントを追加

- Pydantic スキーマ WineCreate を定義
- services/wine_service.py に create_wine メソッドを実装
- ユニットテストを追加
- CORS設定を確認

refs #42
```

### PR タイトル
```
<area>: <short description>
```

例：
```
feat: ワイン在庫管理ダッシュボード実装
```

### PR 本文に含める内容
- **変更内容**:  何をしたか
- **なぜ**:  理由と背景
- **テスト方法**: 変更を検証する手順
- **関連 issue**: `refs #123` または `fixes #123`
- **チェックリスト**: テスト完了、ドキュメント更新など

例：
```markdown
## 変更内容
ダッシュボード統計カード、株式トレンドチャート、地域別分布円グラフを実装

## なぜ
ユーザーが在庫状況を視覚的に把握できるようにするため

## テスト方法
1. ダッシュボードページへアクセス
2. 統計データが正しく表示されることを確認
3. チャートが正しくレンダリングされることを確認

## チェックリスト
- [x] ユニットテスト追加
- [x] 型定義を確認
- [x] コードレビュー対応

refs #100
```

---

## ファイル・ディレクトリ命名規則（まとめ）

| 種類 | 規則 | 例 |
|------|------|-----|
| React コンポーネント | PascalCase | `WineCard. tsx`、`LoginForm.tsx` |
| カスタム Hook | camelCase + use プレフィックス | `useWines.ts`、`useAuth.ts` |
| 関数・変数（FE） | camelCase | `formatDate.ts`、`validateEmail()` |
| 関数・変数（BE） | snake_case | `create_wine()`、`get_transactions()` |
| Pydantic モデル | TitleCase | `WineCreate`、`UserResponse` |
| SQLAlchemy モデル | TitleCase | `Wine`、`InventoryTransaction` |
| ルーターファイル | snake_case | `auth.py`、`wines.py` |
| 定数 | UPPER_SNAKE_CASE | `API_BASE_URL`、`DEFAULT_PAGE_SIZE` |
| CSS クラス | kebab-case（Tailwind） | `text-primary-600`、`bg-surface-light` |

---

## プロジェクト構造概要

```
wine-inventory/
├── . github/
│   └── workflows/          # GitHub Actions ワークフロー
├── backend/                # FastAPI バックエンド
│   ├── routers/           # API ルーター
│   ├── services/          # ビジネスロジック
│   ├── models. py          # SQLAlchemy モデル
│   ├── schemas.py         # Pydantic スキーマ
│   ├── auth.py            # 認証ロジック
│   ├── database.py        # DB 設定
│   ├── main.py            # エントリーポイント
│   └── requirements.txt
├── frontend/               # React + TypeScript フロントエンド
│   ├── src/
│   │   ├── components/    # UI コンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── hooks/        # カスタム Hook
│   │   ├── contexts/     # Context API
│   │   ├── services/     # API クライアント
│   │   ├── types/        # 型定義
│   │   ├── utils/        # ユーティリティ
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind. config.js
├── . claude/
│   └── CLAUDE. md          # 本ファイル（Claude AI 指示書）
├── README. md              # プロジェクト概要
├── init. sh                # 初期化スクリプト
└── features.db            # SQLite データベース
```

---

## 開発ワークフロー

### 1. フィーチャー開発
- 新しいフィーチャーブランチを作成:  `git checkout -b feat/feature-name`
- 実装 → テスト → コミット → PR

### 2. バグ修正
- バグ修正ブランチを作成: `git checkout -b fix/bug-name`
- 修正 → テスト → コミット → PR

### 3. ドキュメント更新
- ドキュメントブランチを作成: `git checkout -b docs/doc-name`
- 更新 → コミット → PR

### 4. ローカル開発環境での実行
```bash
# 初回セットアップ
./init.sh

# または手動で
# バックエンド
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements. txt
uvicorn main:app --reload --port 8000

# フロントエンド（別ターミナル）
cd frontend
npm install
npm run dev  # http://localhost:5173
```

---

## よくある質問（FAQ）

### Q1: 新しいコンポーネントを追加する場合？
A: `components/` に PascalCase のファイルを作成し、Props を interface で定義してください。

### Q2: API エンドポイントを追加する場合？
A:  
1. `schemas.py` に Pydantic スキーマを定義
2. `services/` にビジネスロジックを実装
3. `routers/` に API ルートを定義
4. テストを追加

### Q3: DB スキーマを変更する場合？
A: 
1. `models.py` を更新
2. Alembic マイグレーションを作成（推奨）
3. テストで動作を確認

### Q4: 環境変数の追加？
A:  `.env` ファイルに追加し、`os.getenv()` で読み込む。本番環境では GitHub Secrets を使用。

### Q5: フロントエンドで複雑な状態管理が必要な場合？
A: React Context + useReducer または Redux を検討。小規模な場合は useState + 複数 custom hooks で対応。

---

## 更新履歴

| 日付 | 変更内容 |
|------|--------|
| 2024-01-12 | 初版作成 — Claude AI 指示書（日本語） |

このドキュメントはプロジェクトの成長に合わせて定期的に更新してください。変更があれば、対応する実装とテストとともに PR を作成してください。