package com.springboot.auth.userDetails;

import com.springboot.auth.utils.JwtAuthorityUtils;
import com.springboot.exception.BusinessLogicException;
import com.springboot.exception.ExceptionCode;
import com.springboot.user.entity.User;
import com.springboot.user.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Optional;

@Component
public class UsersDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final JwtAuthorityUtils jwtAuthorityUtils;

    public UsersDetailsService(UserRepository memberRepository, JwtAuthorityUtils jwtAuthorityUtils) {
        this.userRepository = memberRepository;
        this.jwtAuthorityUtils = jwtAuthorityUtils;
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> optionalMember = userRepository.findByEmail(username);

        User findUser = optionalMember.orElseThrow( () -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        return new UsersDetails(findUser);
    }
    private final class UsersDetails extends User implements UserDetails{
        UsersDetails(User user){
            setUserId(user.getUserId());
            setEmail(user.getEmail());
            setPassword(user.getPassword());
            setRoles(user.getRoles());
        }
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return jwtAuthorityUtils.createAuthorities(this.getRoles());
        }

        @Override
        public String getUsername() {
            return this.getEmail();
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return true;
        }
    }
}
