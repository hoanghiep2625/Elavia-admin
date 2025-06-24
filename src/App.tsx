import { Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { default as simpleRestProvider } from "@refinedev/simple-rest";
import { axiosInstance } from "./axiosInstance";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import { Login } from "./pages/login";
import {
  ProductList,
  ProductCreate,
  ProductEdit,
  ProductShow,
} from "./pages/products";
import {
  ProductVariantList,
  ProductVariantCreate,
  ProductVariantEdit,
  ProductVariantShow,
} from "./pages/productsVariant";
import { OrderEdit, OrderList, OrderShow } from "./pages/orders";
import { UserEdit, UserList, UserShow,UserCreate } from "./pages/users";
import StatsDashboard from "./pages/stats/dashboard";
import {
  AttributeCreate,
  AttributeEdit,
  AttributeList,
  AttributeShow,
} from "./pages/attributes";
import { SiteSettingsPage } from "./pages/settings/edit";

// Import Ant Design icons
import {
  DashboardOutlined,
  TagsOutlined,
  SettingOutlined,
  ShoppingOutlined,
  AppstoreAddOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const customDataProvider = simpleRestProvider(
  `${import.meta.env.VITE_API_URL}/admin`,
  axiosInstance
);

function App() {
  return (
    <BrowserRouter>
      {/* <GitHubBanner /> */}
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={customDataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                authProvider={authProvider}
                resources={[
                  {
                    name: "stats",
                    // options: { label: "Thống kê" },
                    list: "/stats",
                    meta: {
                      label: "Dashboard",
                      icon: <DashboardOutlined />,
                    },
                  },
                  {
                    name: "categories",
                    // options: { label: "Quản lý danh mục" },
                    list: "/categories",
                    create: "/categories/create",
                    edit: "/categories/edit/:id",
                    show: "/categories/show/:id",
                    meta: {
                      canDelete: true,
                      icon: <TagsOutlined />,
                    },
                  },
                  {
                    name: "attributes",
                    // options: { label: "Quản lý Thuộc tính" },
                    list: "/attributes",
                    create: "/attributes/create",
                    edit: "/attributes/edit/:id",
                    show: "/attributes/show/:id",
                    meta: {
                      canDelete: true,
                      icon: <SettingOutlined />,
                    },
                  },
                  {
                    name: "products",
                    // options: { label: "Quản lý sản phẩm" },
                    list: "/products",
                    create: "/products/create",
                    edit: "/products/edit/:id",
                    show: "/products/show/:id",
                    meta: {
                      canDelete: true,
                      icon: <ShoppingOutlined />,
                    },
                  },
                  {
                    name: "variants",
                    // options: { label: "Quản lý biến thể sản phẩm" },
                    list: "/variants",
                    create: "/variants/create",
                    edit: "/variants/edit/:id",
                    show: "/variants/show/:id",
                    meta: {
                      canDelete: true,
                      icon: <AppstoreAddOutlined />,
                    },
                  },
                  {
                    name: "orders",
                    // options: { label: "Quản lý đơn hàng" },
                    list: "/orders",
                    show: "/orders/show/:id",
                    edit: "/orders/edit/:id",
                    meta: {
                      icon: <ShoppingCartOutlined />,
                    },
                  },
                  {
                    name: "users",
                    // options: { label: "Quản lý người dùng" },
                    list: "/users",
                    show: "/users/show/:id",
                    edit: "/users/edit/:id",
                    meta: {
                      icon: <UserOutlined />,
                    },
                  },
                  {
                    name: "site-settings",
                    // options: { label: "Cài đặt website" },
                    list: SiteSettingsPage,
                    edit: SiteSettingsPage,
                    meta: {
                      icon: <SettingOutlined />,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "5c4a9t-lujYMq-nB2Y53",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2
                          Header={Header}
                          Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="categories" />}
                    />
                    <Route path="/stats">
                      <Route index element={<StatsDashboard />} />
                    </Route>
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route>
                    <Route path="/attributes">
                      <Route index element={<AttributeList />} />
                      <Route path="create" element={<AttributeCreate />} />
                      <Route path="edit/:id" element={<AttributeEdit />} />
                      <Route path="show/:id" element={<AttributeShow />} />
                    </Route>
                    <Route path="/products">
                      <Route index element={<ProductList />} />
                      <Route path="create" element={<ProductCreate />} />
                      <Route
                        path="edit/:id"
                        element={<ProductEdit variantId={""} />}
                      />
                      <Route path="show/:id" element={<ProductShow />} />
                    </Route>
                    <Route path="/variants">
                      <Route index element={<ProductVariantList />} />
                      <Route
                        path="create/:id"
                        element={<ProductVariantCreate />}
                      />
                      <Route path="edit/:id" element={<ProductVariantEdit />} />
                      <Route path="show/:id" element={<ProductVariantShow />} />
                    </Route>
                    <Route path="/orders">
                      <Route index element={<OrderList />} />
                      <Route path="edit/:id" element={<OrderEdit />} />
                      <Route path="show/:id" element={<OrderShow />} />
                    </Route>
                    <Route path="/users">
                      <Route index element={<UserList />} />
                      <Route path="show/:id" element={<UserShow />} />
                      <Route path="edit/:id" element={<UserEdit />} />
                      <Route path="create" element={<UserCreate />} />
                    </Route>
                    <Route
                      path="/site-settings"
                      element={<SiteSettingsPage />}
                    />
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>

                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
