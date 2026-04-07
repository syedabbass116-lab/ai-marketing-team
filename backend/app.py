import streamlit as st
import requests

st.set_page_config(page_title="AI Marketing Team", layout="wide")

# ---------------- SIDEBAR ----------------
st.sidebar.title("🚀 ContentOS")

page = st.sidebar.radio("Navigation", [
    "Dashboard",
    "Generate Content",
    "Content Library",
    "Brand Settings"
])

st.sidebar.markdown("---")
st.sidebar.write("👤 Your Profile")
st.sidebar.button("Logout")

# ---------------- BRAND SETTINGS (STATE) ----------------
if "tone" not in st.session_state:
    st.session_state.tone = "Professional"

# ---------------- DASHBOARD ----------------
if page == "Dashboard":
    st.title("📊 Dashboard")
    st.write("Welcome to your AI Marketing Team")

# ---------------- GENERATE CONTENT ----------------
elif page == "Generate Content":

    st.title("✨ Generate Content")

    col1, col2 = st.columns([3, 1])

    with col1:
        topic = st.text_input("Enter your idea")

    with col2:
        platform = st.selectbox(
            "Platform", ["All", "LinkedIn", "Twitter", "Instagram", "YouTube"])

    if st.button("Generate Content"):

        with st.spinner("Generating..."):
            response = requests.get(
                "http://127.0.0.1:8000/generate",
                params={"topic": topic}
            )

            data = response.json()

            if "error" in data:
                st.error(data["error"])
            else:
                st.success("Generated!")

                # STORE IN SESSION
                st.session_state["last_content"] = data

                # DISPLAY CARDS
                for key, value in data.items():
                    with st.container():
                        st.markdown(f"### {key.upper()}")
                        st.write(value)

                        col1, col2, col3, col4 = st.columns(4)

                        with col1:
                            st.button("Copy", key=f"copy_{key}")

                        with col2:
                            st.button("Regenerate", key=f"regen_{key}")

                        with col3:
                            if st.button("Save", key=f"save_{key}"):
                                if "library" not in st.session_state:
                                    st.session_state["library"] = []
                                st.session_state["library"].append(value)

                        with col4:
                            st.button("Edit", key=f"edit_{key}")

    # ---------------- REPURPOSE ----------------
    if "last_content" in st.session_state:

        st.markdown("---")
        st.subheader("🔁 Repurpose Content")

        if st.button("Repurpose into all platforms"):

            content = st.session_state["last_content"]["linkedin"]

            response = requests.get(
                "http://127.0.0.1:8000/generate",
                params={"topic": content}
            )

            data = response.json()

            st.write(data)

# ---------------- CONTENT LIBRARY ----------------
elif page == "Content Library":

    st.title("📚 Content Library")

    if "library" not in st.session_state or len(st.session_state["library"]) == 0:
        st.info("No saved content yet")
    else:
        for i, content in enumerate(st.session_state["library"]):
            with st.container():
                st.write(content)
                st.button("Delete", key=f"delete_{i}")

# ---------------- BRAND SETTINGS ----------------
elif page == "Brand Settings":

    st.title("🎯 Brand Settings")

    tone = st.selectbox(
        "Brand Voice",
        ["Professional", "Casual", "Bold", "Inspirational"]
    )

    audience = st.text_input("Target Audience")

    if st.button("Save Settings"):
        st.session_state.tone = tone
        st.success("Saved!")
