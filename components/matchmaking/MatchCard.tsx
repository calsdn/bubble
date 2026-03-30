import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
 Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MatchingGroup, GroupMember } from "@/hooks/useMatchmaking";
import { createSignedUrlForAvatar } from "@/utils/avatarUtils";


interface MatchCardProps {
  group: MatchingGroup;
  onUserPress: (user: GroupMember) => void;
  style?: any;
}

const screenWidth = Dimensions.get("window").width;
const cardDiameter = Math.min(screenWidth * 1.12, 400);
const memberImageSize = cardDiameter * 0.44;
const memberOverlap = memberImageSize * 0.18;

export const MatchCard: React.FC<MatchCardProps> = ({
  group,
  onUserPress,
  style,
}) => {
  const [memberSignedUrls, setMemberSignedUrls] = useState<{
    [key: string]: string;
  }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );

  // 이제 avatar_url이 이미 영구적인 공개 URL입니다
  useEffect(() => {
    if (!group?.members) return; // Use optional chaining for safety

    const urls: { [key: string]: string } = {};

    for (const member of group.members) {
      if (member.avatar_url) {
        urls[member.id] = member.avatar_url; // avatar_url을 그대로 사용
      }
    }

    setMemberSignedUrls(urls);
  }, [group?.members]); // Use optional chaining for safety

  const handleImageError = (userId: string) => {
    setImageErrors((prev) => ({ ...prev, [userId]: true }));
  };

  // 🔍 DEBUG: group 데이터 체크 (moved after hooks)
  console.log("=== 🎴 MATCHCARD DEBUG ===");
  console.log("Group:", group);
  console.log("Group exists:", !!group);
  console.log("Group members:", group?.members);

  // group이 undefined인 경우 처리 (moved after hooks)
  if (!group) {
    console.log("❌ No group data provided to MatchCard");
    return (
      <View style={[styles.container, style]}>
        <BlurView
          style={styles.blurContainer}
          intensity={Platform.OS === "ios" ? 60 : 80}
          tint="light"
        >
          <Text style={styles.groupName}>Loading...</Text>
        </BlurView>
      </View>
    );
  }

  const renderMemberImage = (member: GroupMember, index: number) => {
    const signedUrl = memberSignedUrls[member.id]; // user_id 대신 id 사용
    const hasError = imageErrors[member.id]; // user_id 대신 id 사용

    const handlePress = () => {
      console.log("=== 🖼️ IMAGE CLICK DEBUG ===");
      console.log("Member:", member);
      console.log("Member ID:", member.id);
      console.log("User ID:", member.id);
      console.log("onUserPress function:", typeof onUserPress);
      console.log("Calling onUserPress...");
      onUserPress(member);
      console.log("onUserPress called successfully");
    };

    return (
      <View
        key={member.id} // user_id 대신 id 사용
        style={{
          marginLeft: index === 1 ? -memberOverlap : 0,
          zIndex: index === 0 ? 2 : 1,
          alignItems: "center",
        }}
      >
        <Text style={styles.memberName}>
          {member.first_name} {member.age || ""}
        </Text>

        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={{ alignItems: "center" }}
        >
          <View style={styles.imageContainer}>
            {signedUrl && !hasError ? (
              <Image
                source={{ uri: signedUrl }}
                style={styles.memberImage}
                onError={() => handleImageError(member.id)} // user_id 대신 id 사용
              />
            ) : (
              <View style={[styles.memberImage, styles.placeholderImage]}>
                <Feather name="user" size={memberImageSize * 0.4} color="#999" />
              </View>
            )}
            <Image
              source={require("@/assets/images/bubble-frame.png")}
              style={styles.bubbleFrame}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <BlurView
        style={styles.blurContainer}
        intensity={Platform.OS === "ios" ? 60 : 80}
        tint="light"
      >
        <Text style={styles.groupName}>{group.group_name}</Text>

        <View style={styles.membersContainer}>
          {group.members?.map((member, index) =>
            renderMemberImage(member, index)
          )}
        </View>

        <Image
          source={require("@/assets/images/bubble_group-frame.png")}
          style={styles.groupFrameOverlay}
        />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardDiameter,
    height: cardDiameter,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blurContainer: {
    width: cardDiameter,
    height: cardDiameter,
    borderRadius: cardDiameter / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  groupName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 18,
    marginTop: 12,
    textAlign: "center",
  },
  membersContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
  },
  memberName: {
    fontSize: 20,
    color: "#303030",
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  memberImage: {
    width: memberImageSize,
    height: memberImageSize,
    borderRadius: memberImageSize / 2,
    borderWidth: 2.5,
    borderColor: "#fff",
    backgroundColor: "#eee",
    marginBottom: 8,
  },
  placeholderImage: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  scoreText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 4,
  },
  imageContainer: {
    position: "relative",
    width: memberImageSize,
    height: memberImageSize,
  },
  bubbleFrame: {
    position: "absolute",
    top: 0,
    left: 0,
    width: memberImageSize,
    height: memberImageSize,
    resizeMode: "cover",
  },
  groupFrameOverlay: {
    position: "absolute",
    top: -(cardDiameter * 0.1),
    left: -(cardDiameter * 0.1),
    width: cardDiameter * 1.2,
    height: cardDiameter * 1.2,
    resizeMode: "cover",
  },
});
